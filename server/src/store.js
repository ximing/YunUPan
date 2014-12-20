import {
  CopyObjectCommand,
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutBucketLifecycleConfigurationCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import crypto from 'crypto';
import fs from 'fs';
import { isExpired } from './ttl.js';

const CODE_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';

function config() {
  return {
    bucket: process.env.ATTACHMENT_S3_BUCKET || 'upan',
    prefix: (process.env.ATTACHMENT_S3_PREFIX || 'files').replace(/^\/+|\/+$/g, ''),
    region: process.env.ATTACHMENT_S3_REGION || 'cn-beijing',
    endpoint: process.env.ATTACHMENT_S3_ENDPOINT || '',
    accessKeyId: process.env.ATTACHMENT_S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.ATTACHMENT_S3_SECRET_ACCESS_KEY || '',
  };
}

export function s3Configured() {
  const cfg = config();
  return Boolean(cfg.endpoint && cfg.accessKeyId && cfg.secretAccessKey && cfg.bucket);
}

let client;
let ready;

function s3() {
  if (client) return client;
  const cfg = config();
  const endpoint = cfg.endpoint;
  const isAliyun = Boolean(endpoint && (endpoint.includes(cfg.region) || endpoint.includes('aliyuncs')));
  client = new S3Client({
    region: cfg.region,
    endpoint: endpoint || undefined,
    forcePathStyle: endpoint ? !isAliyun : undefined,
    credentials: {
      accessKeyId: cfg.accessKeyId,
      secretAccessKey: cfg.secretAccessKey,
    },
  });
  return client;
}

function keyFor(code) {
  const { prefix } = config();
  return prefix ? `${prefix}/${code}` : code;
}

function notFound(error) {
  const status = error?.$metadata?.httpStatusCode;
  return error?.name === 'NotFound' || error?.name === 'NoSuchKey' || status === 404;
}

function metaFromHead(head) {
  const meta = head.Metadata || {};
  return {
    filename: safeDecode(meta.filename || 'file'),
    contentType: head.ContentType || 'application/octet-stream',
    size: Number(head.ContentLength || meta.size || 0),
    uploadedAt: meta.uploadedat || head.LastModified?.toISOString() || '',
    isPublic: meta.public === '1',
    downCount: Number(meta.downcount || 0),
  };
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

async function head(code) {
  try {
    const headResult = await s3().send(new HeadObjectCommand({
      Bucket: config().bucket,
      Key: keyFor(code),
    }));
    return metaFromHead(headResult);
  } catch (error) {
    if (notFound(error)) return null;
    throw error;
  }
}

function randomCode() {
  let code = '';
  for (let i = 0; i < 4; i += 1) {
    code += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

export async function ensureStore() {
  if (!s3Configured()) throw new Error('S3 is not configured');
  if (ready) return;
  const { bucket, prefix } = config();
  try {
    await s3().send(new HeadBucketCommand({ Bucket: bucket }));
  } catch (error) {
    if (error?.$metadata?.httpStatusCode === 404 || error?.name === 'NotFound') {
      await s3().send(new CreateBucketCommand({ Bucket: bucket }));
    } else {
      throw error;
    }
  }
  try {
    await s3().send(new PutBucketLifecycleConfigurationCommand({
      Bucket: bucket,
      LifecycleConfiguration: {
        Rules: [{
          ID: 'upan-expire-one-day',
          Status: 'Enabled',
          Filter: { Prefix: prefix ? `${prefix}/` : '' },
          Expiration: { Days: 1 },
        }],
      },
    }));
  } catch (error) {
    console.error('lifecycle rule not applied:', error.name || error.message);
  }
  ready = true;
}

async function allocCode() {
  for (let i = 0; i < 30; i += 1) {
    const code = randomCode();
    const existing = await head(code);
    if (!existing) return code;
    if (isExpired(existing.uploadedAt)) {
      await remove(code);
      return code;
    }
  }
  throw new Error('could not allocate an extraction code');
}

export async function putFile({ filename, contentType, size, filePath }) {
  await ensureStore();
  const code = await allocCode();
  const uploadedAt = new Date().toISOString();
  await s3().send(new PutObjectCommand({
    Bucket: config().bucket,
    Key: keyFor(code),
    Body: fs.createReadStream(filePath),
    ContentLength: size,
    ContentType: contentType || 'application/octet-stream',
    Metadata: {
      filename: encodeURIComponent(filename || 'file'),
      uploadedat: uploadedAt,
      public: '0',
      downcount: '0',
      size: String(size),
    },
  }));
  return code;
}

export async function statFile(code) {
  if (!/^[0-9a-z]{4}$/.test(code || '')) return null;
  await ensureStore();
  const meta = await head(code);
  if (!meta) return null;
  if (isExpired(meta.uploadedAt)) {
    await remove(code);
    return null;
  }
  return { code, ...meta };
}

export async function openFile(code) {
  const meta = await statFile(code);
  if (!meta) return null;
  const obj = await s3().send(new GetObjectCommand({
    Bucket: config().bucket,
    Key: keyFor(code),
  }));
  return { meta, body: obj.Body };
}

async function writeMeta(code, meta, patch) {
  const next = { ...meta, ...patch };
  await s3().send(new CopyObjectCommand({
    Bucket: config().bucket,
    CopySource: `${config().bucket}/${keyFor(code)}`,
    Key: keyFor(code),
    MetadataDirective: 'REPLACE',
    ContentType: next.contentType,
    Metadata: {
      filename: encodeURIComponent(next.filename || 'file'),
      uploadedat: next.uploadedAt,
      public: next.isPublic ? '1' : '0',
      downcount: String(next.downCount || 0),
      size: String(next.size || 0),
    },
  }));
  return { code, ...next };
}

export async function incrementDown(code) {
  const meta = await statFile(code);
  if (!meta) return null;
  return writeMeta(code, meta, { downCount: (meta.downCount || 0) + 1 });
}

export async function markPublic(code) {
  const meta = await statFile(code);
  if (!meta) return null;
  if (meta.isPublic) return meta;
  return writeMeta(code, meta, { isPublic: true });
}

export async function listPublic() {
  await ensureStore();
  const files = [];
  let token;
  do {
    const page = await s3().send(new ListObjectsV2Command({
      Bucket: config().bucket,
      Prefix: keyFor('').replace(/\/$/, '') ? `${config().prefix}/` : undefined,
      ContinuationToken: token,
    }));
    for (const item of page.Contents || []) {
      const code = item.Key.split('/').pop();
      if (!/^[0-9a-z]{4}$/.test(code)) continue;
      const meta = await statFile(code);
      if (meta?.isPublic) files.push(meta);
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  files.sort((a, b) => b.downCount - a.downCount);
  return files;
}

export async function remove(code) {
  await s3().send(new DeleteObjectCommand({
    Bucket: config().bucket,
    Key: keyFor(code),
  }));
}

export async function sweep() {
  if (!s3Configured()) return 0;
  await ensureStore();
  let token;
  let removed = 0;
  do {
    const page = await s3().send(new ListObjectsV2Command({
      Bucket: config().bucket,
      Prefix: config().prefix ? `${config().prefix}/` : undefined,
      ContinuationToken: token,
    }));
    for (const item of page.Contents || []) {
      const code = item.Key.split('/').pop();
      if (!/^[0-9a-z]{4}$/.test(code)) continue;
      try {
        const meta = await head(code);
        if (meta && isExpired(meta.uploadedAt)) {
          await remove(code);
          removed += 1;
        }
      } catch (error) {
        console.error('sweep skip', code, error.name || error.message);
      }
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  if (removed) console.log(`sweep deleted ${removed}`);
  return removed;
}
