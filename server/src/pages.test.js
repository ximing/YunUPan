import assert from 'node:assert/strict';
import test from 'node:test';
import { renderView } from './pages.js';
import { formatFileSize, isExpired, TTL_MS } from './ttl.js';

test('a file expires 24 hours after upload', () => {
  const uploaded = '2014-12-20T10:00:00.000Z';
  const uploadedMs = Date.parse(uploaded);
  assert.equal(isExpired(uploaded, uploadedMs + TTL_MS - 1), false);
  assert.equal(isExpired(uploaded, uploadedMs + TTL_MS), true);
  assert.equal(isExpired('not-a-date'), true);
});

test('file sizes use the original display format', () => {
  assert.equal(formatFileSize(512), '512.00 bytes');
  assert.equal(formatFileSize(2048), '2.00 KB');
  assert.equal(formatFileSize(5 * 1024 * 1024), '5.00 MB');
});

test('home page stays the original uploader', () => {
  const html = renderView('Index');
  assert.match(html, /选择文件/);
  assert.match(html, /src="\/js\/upload\.js"/);
  assert.match(html, /href="\/Home\/DownFileView"/);
  assert.match(html, /href="https:\/\/upan\.aimo\.plus\/"/);
  assert.doesNotMatch(html, /upan\.oureda\.cn/);
  assert.doesNotMatch(html, /@model|@\{|@\*/);
});

test('rendered pages do not leak razor', () => {
  for (const name of ['Index', 'DownFileView', 'Introduce', 'Question', 'Inform', 'Fdownload', 'TextIndex', 'BigIndex']) {
    const html = renderView(name);
    assert.doesNotMatch(html, /@model|@using|@foreach|@TempData|~\//, name);
  }
  const pub = renderView('Public', { publicFiles: [] });
  assert.doesNotMatch(pub, /@model|@using|@foreach|@TempData|~\//);
});

test('download page shows the extraction error', () => {
  const html = renderView('DownFileView', { error: '提取码不存在', randName: 'ab12' });
  assert.match(html, /提取码不存在/);
  assert.match(html, /value="ab12"/);
  assert.match(html, /action="\/Home\/DownFileByrandName"/);
});

test('public share rows replace the razor loop', () => {
  const html = renderView('Public', {
    publicFiles: [{ code: 'ab12', filename: '笔记<script>.txt', size: 2048, downCount: 3 }],
  });
  assert.match(html, /ab12/);
  assert.match(html, /笔记&lt;script&gt;\.txt/);
  assert.match(html, /2\.00 KB/);
  assert.match(html, /DownPublicFileByrandName\?randName=ab12/);
  assert.doesNotMatch(html, /@foreach|@item/);
});
