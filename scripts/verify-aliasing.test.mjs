import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const data = JSON.parse(readFileSync(new URL('src/data/aliasing-results.json', root), 'utf8'));
const html = readFileSync(new URL('dist/blog/dropping-audio-samples-aliasing/index.html', root), 'utf8');

test('website media matches the verified notebook artifacts', () => {
  assert.equal(data.verified, true);
  assert.ok(data.aliasReductionDb > 50);
  assert.equal(Object.keys(data.artifactSha256).length, 9);
  for (const [filename, hash] of Object.entries(data.artifactSha256)) {
    const bytes = readFileSync(new URL('public/note-assets/aliasing/' + filename, root));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), hash);
  }
});

test('all clips have matching duration and mono PCM16 format', () => {
  for (const [filename, rate] of [
    ['original-64khz.wav', 64000], ['unfiltered-32khz.wav', 32000], ['filtered-32khz.wav', 32000],
  ]) {
    const bytes = readFileSync(new URL('public/note-assets/aliasing/' + filename, root));
    assert.equal(bytes.readUInt16LE(22), 1);
    assert.equal(bytes.readUInt16LE(34), 16);
    assert.equal(bytes.readUInt32LE(24), rate);
    assert.equal(bytes.readUInt32LE(40) / (2 * rate), 4);
  }
});

test('built article is brief, code-free and uses three non-autoplay players', () => {
  assert.equal((html.match(/<audio\b/g) ?? []).length, 3);
  assert.doesNotMatch(html, /<audio[^>]*autoplay/);
  assert.doesNotMatch(html, /<pre\b|<code\b|piano|D:\\|C:\\|OneDrive|127\.0\.0\.1/i);
  const article = html.match(/<article\b[\s\S]*?<\/article>/)[0];
  const mainCopy = article.replace(/<details\b[\s\S]*?<\/details>/g, '')
    .replace(/<[^>]*>/g, ' ').replace(/&[^;]+;/g, ' ');
  const wordCount = mainCopy.trim().split(/\s+/).length;
  assert.ok(wordCount >= 300 && wordCount <= 450, 'Unexpected article word count: ' + wordCount);
  if (data.repositoryUrl === null) assert.doesNotMatch(html, /Explore the experiment on GitHub/);
  else {
    assert.ok(html.includes('href="' + data.repositoryUrl + '"'));
    assert.match(html, /Explore the experiment on GitHub/);
  }
});

test('frequency analysis is initially collapsed and all figures have alt text', () => {
  const details = html.match(/<details\b[^>]*>/)[0];
  assert.doesNotMatch(details, /\bopen(?:[ =>])/);
  assert.equal((html.match(/<img\b/g) ?? []).length, 6);
  for (const tag of html.match(/<img\b[^>]*>/g)) assert.match(tag, /\balt="[^"]+"/);
  assert.ok(html.includes(data.aliasReductionDb.toFixed(2)));
});

test('original waveform follows the input and each output has waveform plus FFT', () => {
  const input = html.indexOf('id="original-heading"');
  const waveform = html.indexOf('original-waveform.png');
  const comparison = html.indexOf('class="comparison-grid');
  assert.ok(input < waveform && waveform < comparison);
  const analysis = html.match(/<details\b[\s\S]*?<\/details>/)[0];
  assert.ok(analysis.includes('32 kHz − 31 kHz = 1 kHz'));
  for (const output of ['unfiltered', 'filtered']) {
    assert.ok(analysis.includes('/' + output + '-waveform.png'));
    assert.ok(analysis.includes('/' + output + '-fft.png'));
    assert.ok(analysis.indexOf('/' + output + '-waveform.png') < analysis.indexOf('/' + output + '-fft.png'));
  }
});

test('built article, listing and home preserve GitHub Pages base paths', () => {
  for (const filename of Object.keys(data.artifactSha256)) {
    assert.ok(html.includes('/my-portfolio/note-assets/aliasing/' + filename));
  }
  assert.ok(html.includes('href="/my-portfolio/blog/"'));
  for (const path of ['dist/index.html', 'dist/blog/index.html']) {
    const listing = readFileSync(new URL(path, root), 'utf8');
    assert.ok(listing.includes('/my-portfolio/blog/dropping-audio-samples-aliasing/'));
  }
});
