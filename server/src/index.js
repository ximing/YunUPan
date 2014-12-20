import express from 'express';
import fs from 'fs';
import multer from 'multer';
import os from 'os';
import path from 'path';
import { pathToFileURL } from 'url';
import { renderView, siteRoot } from './pages.js';
import {
  incrementDown,
  listPublic,
  markPublic,
  openFile,
  putFile,
  s3Configured,
  statFile,
  sweep,
} from './store.js';

const MAX_UPLOAD_BYTES = Number(process.env.MAX_UPLOAD_BYTES || 512 * 1024 * 1024);
const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
});

const app = express();
app.set('trust proxy', true);
app.disable('x-powered-by');

function sendPage(res, name, data) {
  res.type('html').send(renderView(name, data));
}

function codeOf(req) {
  return String(req.params.randName || req.query.randName || '').trim().toLowerCase();
}

async function sendDownload(req, res, { count = true } = {}) {
  const code = codeOf(req);
  const opened = await openFile(code);
  if (!opened) {
    res.redirect(`/Home/Inform?randName=${encodeURIComponent(code)}`);
    return;
  }
  if (count) {
    try { await incrementDown(code); } catch (error) {
      console.error('down count', error.name || error.message);
    }
  }
  const filename = opened.meta.filename || 'file';
  const ascii = filename.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, '');
  res.setHeader('Content-Type', opened.meta.contentType || 'application/octet-stream');
  if (opened.meta.size) res.setHeader('Content-Length', String(opened.meta.size));
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
  );
  opened.body.pipe(res);
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/Home/Upload', (req, res) => {
  upload.any()(req, res, async (error) => {
    const file = req.files?.[0];
    const cleanup = () => {
      if (file?.path) fs.unlink(file.path, () => {});
    };
    try {
      if (error?.code === 'LIMIT_FILE_SIZE') {
        res.type('text').send('-1');
        return;
      }
      if (error) {
        console.error('upload', error.message);
        res.type('text').send('-2');
        return;
      }
      if (!file || file.size === 0) {
        res.type('text').send('0');
        return;
      }
      if (!s3Configured()) {
        res.type('text').send('-2');
        return;
      }
      const code = await putFile({
        filename: decodeUploadName(file.originalname),
        contentType: file.mimetype,
        size: file.size,
        filePath: file.path,
      });
      res.type('text').send(code);
    } catch (err) {
      console.error('upload failed', err.name || err.message);
      res.type('text').send('-2');
    } finally {
      cleanup();
    }
  });
});

app.get('/Home/Download1/:randName', async (req, res) => {
  try {
    const meta = await statFile(codeOf(req));
    res.type('text').send(meta ? '2' : '0');
  } catch (error) {
    console.error('download1', error.name || error.message);
    res.type('text').send('0');
  }
});

app.get('/Home/Download/:randName', async (req, res, next) => {
  try {
    await sendDownload(req, res);
  } catch (error) {
    next(error);
  }
});

app.get(['/Home/DownFile', '/Home/DownFileByrandName'], async (req, res, next) => {
  try {
    const code = codeOf(req);
    if (!code) {
      sendPage(res, 'DownFileView', { error: '提取码不能为空' });
      return;
    }
    const meta = await statFile(code);
    if (!meta) {
      sendPage(res, 'DownFileView', { error: '提取码不存在', randName: code });
      return;
    }
    await sendDownload(req, res);
  } catch (error) {
    next(error);
  }
});

app.get('/Home/DownPublicFileByrandName', async (req, res, next) => {
  try {
    const code = codeOf(req);
    if (!code) {
      res.redirect('/Home/Public');
      return;
    }
    const referer = req.get('referer');
    if (referer) {
      try {
        const refHost = new URL(referer).hostname;
        const host = (req.get('host') || '').split(':')[0];
        const rootDomain = (name) => name.split('.').slice(-2).join('.');
        if (rootDomain(refHost) !== rootDomain(host)) {
          res.redirect('/Home/Public');
          return;
        }
      } catch {
        res.redirect('/Home/Public');
        return;
      }
    } else {
      res.redirect('/Home/Public');
      return;
    }
    await sendDownload(req, res);
  } catch (error) {
    next(error);
  }
});

app.get('/Home/AddPublic', async (req, res, next) => {
  try {
    const code = codeOf(req);
    if (!code) {
      sendPage(res, 'Index');
      return;
    }
    const meta = await markPublic(code);
    if (!meta) {
      sendPage(res, 'Index');
      return;
    }
    res.redirect('/Home/Public');
  } catch (error) {
    next(error);
  }
});

app.get(['/Home/GetFile/:randName', '/Home/WpGetUrl/:randName'], async (req, res) => {
  try {
    const code = codeOf(req);
    const meta = await statFile(code);
    res.type('text').send(meta ? `/Home/Download/${code}` : '0');
  } catch (error) {
    console.error('getfile', error.name || error.message);
    res.type('text').send('0');
  }
});

app.get('/Home/Public', async (req, res, next) => {
  try {
    const publicFiles = s3Configured() ? await listPublic() : [];
    sendPage(res, 'Public', { publicFiles });
  } catch (error) {
    next(error);
  }
});

const staticDirs = ['css', 'js', 'Scripts', 'image', 'Content', 'fonts'];
for (const dir of staticDirs) {
  app.use(`/${dir}`, express.static(path.join(siteRoot, dir), { fallthrough: true, index: false }));
}

const pageRoutes = {
  '/': 'Index',
  '/Home': 'Index',
  '/Home/Index': 'Index',
  '/Home/DownFileView': 'DownFileView',
  '/Home/Introduce': 'Introduce',
  '/Home/Question': 'Question',
  '/Home/Inform': 'Inform',
  '/Home/Fdownload': 'Fdownload',
  '/Home/TextIndex': 'TextIndex',
  '/Home/BigIndex': 'BigIndex',
  '/Home/Test': 'Test',
  '/Home/TestWebUploader': 'TestWebUploader',
};

for (const [route, view] of Object.entries(pageRoutes)) {
  app.get(route, (req, res) => {
    sendPage(res, view, {
      error: String(req.query.error || ''),
      randName: String(req.query.randName || ''),
    });
  });
}

app.get('/Default1/Test', (_req, res) => {
  res.type('html').send(renderView('Default1/Test'));
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (res.headersSent) return;
  res.status(500).type('text').send('-2');
});

function decodeUploadName(name) {
  if (!name) return 'file';
  const asUtf8 = Buffer.from(name, 'latin1').toString('utf8');
  if (asUtf8.includes('\uFFFD')) return name;
  return asUtf8;
}

export { app };

const invokedDirectly = process.argv[1]
  && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (invokedDirectly) {
  const port = Number(process.env.PORT || 3010);
  app.listen(port, () => {
    const endpoint = process.env.ATTACHMENT_S3_ENDPOINT || '';
    let host = 'unset';
    try { host = endpoint ? new URL(endpoint).host : 'aws'; } catch { host = 'invalid'; }
    console.log(`upan listening on ${port} bucket=${process.env.ATTACHMENT_S3_BUCKET || 'upan'} endpoint=${host}`);
  });
  const runSweep = () => {
    sweep().catch((error) => console.error('sweep', error.name || error.message));
  };
  setInterval(runSweep, 5 * 60 * 1000);
  setTimeout(runSweep, 15 * 1000);
}
