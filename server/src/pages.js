import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { escapeHtml, formatFileSize } from './ttl.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../OurEDA.YunPan.Localhost');
export const siteRoot = root;
const viewsDir = path.join(root, 'Views');

function stripAtBlocks(html) {
  let out = '';
  for (let i = 0; i < html.length; i++) {
    if (html[i] === '@' && html[i + 1] === '{') {
      let depth = 0;
      for (let j = i + 1; j < html.length; j++) {
        if (html[j] === '{') depth += 1;
        else if (html[j] === '}') {
          depth -= 1;
          if (depth === 0) {
            i = j;
            break;
          }
        }
      }
      continue;
    }
    out += html[i];
  }
  return out;
}

export function renderView(name, { error = '', randName = '', publicFiles = null } = {}) {
  const file = name.includes('/')
    ? path.join(viewsDir, `${name}.cshtml`)
    : path.join(viewsDir, 'Home', `${name}.cshtml`);
  let html = fs.readFileSync(file, 'utf8');
  if (html.charCodeAt(0) === 0xfeff) html = html.slice(1);
  html = html.replace(/@\*[\s\S]*?\*@/g, '');
  html = stripAtBlocks(html);
  html = html.replace(/^[\t ]*@model[^\n]*\n/gm, '');
  html = html.replace(/^[\t ]*@using[^\n]*\n/gm, '');
  html = html.replace(/@TempData\["error"\]/g, escapeHtml(error));
  html = html.replace(/@TempData\["randName"\]/g, escapeHtml(randName));
  if (publicFiles) {
    const rows = publicFiles.map((item) => `                        <tr>
                            <td style="color:black">${escapeHtml(item.code)}</td>
                            <td style="color:black;word-break:break-word;word-wrap: break-word;max-width: 300px;">${escapeHtml(item.filename)}</td>
                            <td style="color:black">${escapeHtml(formatFileSize(item.size))}</td>
                            <td style="color:black">${escapeHtml(item.downCount)}</td>
                            <td style="color:black"><a href="/Home/DownPublicFileByrandName?randName=${encodeURIComponent(item.code)}">下载</a></td>
                        </tr>`).join('\n');
    html = html.replace(/@foreach[\s\S]*?\n[ \t]*\}/, rows);
  }
  html = html.replaceAll('~/', '/');
  return html;
}
