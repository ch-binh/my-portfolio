import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

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
