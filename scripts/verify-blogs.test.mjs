import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { estimateReadingMinutes, formatCreationDate, readBlogMetadata } from '../src/lib/blog-metadata.mjs';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const listing = read('dist/blog/index.html');
const home = read('dist/index.html');
const paths = [
  'blog/dropping-audio-samples-aliasing/',
  'blog/self-balancing-electric-motorcycle-paper/',
  'blog/calibrating-loadcells/', 'blog/pdm-vs-pcm/',
  'projects/graduation-thesis/', 'projects/loadcell-weight-system/',
  'projects/pdm-microphone-pcm-audio/', 'projects/stm32-sdmmc-dma-debugging/',
];

test('Blogs combines all eight entries and preserves detail routes', () => {
  assert.match(listing, /<h1[^>]*>Blogs<\/h1>/);
  assert.equal((listing.match(/class="note-entry/g) ?? []).length, 8);
  for (const path of paths) {
    assert.ok(listing.includes('href="/my-portfolio/' + path + '"'));
    assert.ok(home.includes('href="/my-portfolio/' + path + '"'));
    assert.ok(existsSync(new URL('dist/' + path + 'index.html', root)));
  }
});

test('shared navigation and home have one Blogs destination', () => {
  for (const html of [home, listing, read('dist/projects/loadcell-weight-system/index.html')]) {
    const nav = html.match(/<nav\b[\s\S]*?<\/nav>/)[0];
    const labels = [...nav.matchAll(/<a\b[^>]*>(.*?)<\/a>/g)].map(match => match[1]);
    assert.deepEqual(labels, ['Home', 'Blogs', 'About', 'Contact']);
    assert.ok(nav.includes('href="/my-portfolio/blog/"'));
  }
  assert.match(home, /Latest Blogs/);
  assert.doesNotMatch(home, /Recent Projects|Latest Notes/);
});

test('legacy Projects index redirects within the GitHub Pages base', () => {
  const redirect = read('dist/projects/index.html');
  assert.match(redirect, /http-equiv="refresh"/i);
  assert.ok(redirect.includes('/my-portfolio/blog/'));
});

test('both card lists show matching reading time and only known dates', () => {
  for (const html of [listing, home]) {
    assert.equal((html.match(/class="blog-metadata/g) ?? []).length, 8);
    assert.equal((html.match(/<time\b/g) ?? []).length, 4);
    for (const date of ['2026-10-05', '2026-05-31', '2026-05-25', '2026-05-23']) {
      assert.ok(html.includes('datetime="' + date + '"'));
    }
    assert.match(html, /Oct 5, 2026/);
    assert.doesNotMatch(html, /Invalid Date|undefined min read|NaN min read/);
  }
  const listMetadata = [...listing.matchAll(/<div class="blog-metadata[\s\S]*?<\/div>/g)].map(match => match[0].replace(/data-astro-cid-[\w]+/g, ''));
  const homeMetadata = [...home.matchAll(/<div class="blog-metadata[\s\S]*?<\/div>/g)].map(match => match[0].replace(/data-astro-cid-[\w]+/g, ''));
  assert.deepEqual(listMetadata, homeMetadata);
  const aliasing = readBlogMetadata({ path: paths[0], createdAt: '2026-10-05' });
  assert.equal(aliasing.readingMinutes, 2);
  assert.equal(readBlogMetadata({ path: 'projects/loadcell-weight-system/' }).createdAt, null);
});

test('reading time counts prose without code, styles, media or collapsed analysis', () => {
  const prose = 'word '.repeat(201);
  const excluded = 'hidden '.repeat(800);
  assert.equal(estimateReadingMinutes(prose), 2);
  assert.equal(estimateReadingMinutes('word '.repeat(200)), 1);
  assert.equal(estimateReadingMinutes(''), 1);
  assert.equal(estimateReadingMinutes('---\ntitle: hidden\n---\n' + prose +
    '\n```c\n' + excluded + '\n```\n' +
    '<style>' + excluded + '</style><script>' + excluded + '</script>' +
    '<details>' + excluded + '</details><audio>' + excluded + '</audio>' +
    '<pre>' + excluded + '</pre>'), 2);
});

test('creation dates are validated and formatted independently of host timezone', () => {
  assert.equal(formatCreationDate('2026-10-05'), 'Oct 5, 2026');
  assert.throws(() => formatCreationDate('2026-02-30'), /Invalid article/);
  assert.throws(() => formatCreationDate('yesterday'), /Invalid article/);
});
