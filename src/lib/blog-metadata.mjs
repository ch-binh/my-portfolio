import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// An approximate prose-only estimate: no code, media playback or collapsed analysis.
export function estimateReadingMinutes(source) {
  const prose = source
    .replace(/^---\r?\n[\s\S]*?\r?\n---\s*/, '')
    .replace(/<!--[^]*?-->/g, '')
    .replace(/<(script|style|details|pre|code|audio|video)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/^\s*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\s*\1[^\n]*$/gm, '')
    .replace(/`+[^`]*`+/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/&(?:#\d+|#x[\da-f]+|\w+);/gi, ' ');
  const words = prose.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) ?? [];
  return Math.max(1, Math.ceil(words.length / 200));
}

export function formatCreationDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) {
    throw new Error('Invalid article creation date: ' + date);
  }
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
  }).format(new Date(date));
}

export function readBlogMetadata(blog) {
  const stem = resolve('src/pages', blog.path.replace(/\/$/, ''));
  const filename = ['.md', '.astro'].map(extension => stem + extension).find(existsSync);
  if (!filename) throw new Error('Missing article source: ' + blog.path);
  const source = readFileSync(filename, 'utf8');
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  const createdAt = blog.createdAt ?? frontmatter.match(/^date:\s*["']?(\d{4}-\d{2}-\d{2})["']?\s*$/m)?.[1] ?? null;
  if (createdAt) formatCreationDate(createdAt);
  return { createdAt, readingMinutes: estimateReadingMinutes(source) };
}
