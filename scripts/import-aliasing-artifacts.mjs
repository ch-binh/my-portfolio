/**
 * Transfer verified notebook results into static website assets.
 * Usage: node scripts/import-aliasing-artifacts.mjs <experiment-directory>
 * This script validates and copies artifacts. It does not run DSP.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceArgument = process.argv[2];
if (!sourceArgument) throw new Error('Provide the experiment directory containing code/, input/ and output/.');
const sourceRoot = resolve(sourceArgument);
const siteRoot = fileURLToPath(new URL('../', import.meta.url));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const manifest = JSON.parse(readFileSync(resolve(sourceRoot, 'output/results.json'), 'utf8'));
if (manifest.verified !== true) throw new Error('Run and verify the notebook before importing results.');
const notebook = JSON.parse(readFileSync(resolve(sourceRoot, 'code/01_pcm_aliasing_walkthrough.ipynb'), 'utf8'));
const source = notebook.cells.filter(cell => cell.cell_type === 'code')
  .map(cell => Array.isArray(cell.source) ? cell.source.join('') : cell.source).join('\n');
if (sha256(source) !== manifest.source_code_sha256) throw new Error('Notebook code changed after verification.');

const mapping = {
  original_audio: 'original-64khz.wav',
  unfiltered_audio: 'unfiltered-32khz.wav',
  filtered_audio: 'filtered-32khz.wav',
  original_waveform: 'original-waveform.png',
  unfiltered_waveform: 'unfiltered-waveform.png',
  filtered_waveform: 'filtered-waveform.png',
  original_fft: 'original-fft.png',
  unfiltered_fft: 'unfiltered-fft.png',
  filtered_fft: 'filtered-fft.png',
};
const artifacts = {};
const dimensions = {};
for (const [key, filename] of Object.entries(mapping)) {
  const record = manifest.artifacts[key];
  if (!record) throw new Error('Missing verified artifact: ' + key);
  const path = resolve(sourceRoot, record.path);
  const within = relative(sourceRoot, path);
  if (within === '..' || within.startsWith('..' + sep) || isAbsolute(within)) {
    throw new Error('Artifact is outside the experiment directory.');
  }
  const bytes = readFileSync(path);
  if (sha256(bytes) !== record.sha256) throw new Error('Artifact changed after verification: ' + key);
  artifacts[filename] = { bytes, hash: record.sha256 };
  if (filename.endsWith('.png')) {
    if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error('Expected a PNG image.');
    dimensions[filename] = [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
  } else {
    // WAVs produced by Python's wave writer have a standard 44-byte PCM header.
    const expectedRate = key === 'original_audio' ? 64000 : 32000;
    if (bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WAVE'
        || bytes.toString('ascii', 12, 16) !== 'fmt ' || bytes.readUInt32LE(16) !== 16
        || bytes.readUInt16LE(20) !== 1 || bytes.readUInt16LE(22) !== 1
        || bytes.readUInt32LE(24) !== expectedRate || bytes.readUInt16LE(34) !== 16
        || bytes.toString('ascii', 36, 40) !== 'data'
        || bytes.readUInt32LE(40) !== expectedRate * 4 * 2
        || bytes.length !== 44 + expectedRate * 4 * 2) {
      throw new Error('Expected four seconds of mono PCM16 at the verified sample rate.');
    }
  }
}
const m = manifest.measurements;
if (m.input_rate_hz !== 64000 || m.output_rate_hz !== 32000
    || JSON.stringify(m.tones_hz) !== '[3000,10000,31000]'
    || !(m.alias_reduction_db > 50)) throw new Error('Unexpected experiment parameters.');

const dataPath = resolve(siteRoot, 'src/data/aliasing-results.json');
let repositoryUrl = null;
try {
  repositoryUrl = JSON.parse(readFileSync(dataPath, 'utf8')).repositoryUrl ?? null;
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
const data = {
  experiment: '01_pcm_aliasing_walkthrough',
  verified: true,
  inputRateHz: m.input_rate_hz,
  outputRateHz: m.output_rate_hz,
  durationSeconds: 4,
  tonesHz: m.tones_hz,
  aliasReductionDb: m.alias_reduction_db,
  notebookCodeSha256: manifest.source_code_sha256,
  repositoryUrl,
  imageDimensions: dimensions,
  artifactSha256: Object.fromEntries(Object.entries(artifacts).map(([name, item]) => [name, item.hash])),
};
// Validate everything above before replacing any website artifact.
mkdirSync(resolve(siteRoot, 'public/note-assets/aliasing'), { recursive: true });
mkdirSync(resolve(siteRoot, 'src/data'), { recursive: true });
for (const [filename, item] of Object.entries(artifacts)) {
  writeFileSync(resolve(siteRoot, 'public/note-assets/aliasing', filename), item.bytes);
}
writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n');
console.log('Imported 3 verified audio files, 6 plots and public-safe measurements.');
