#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const strip = require('strip-comments');

const ROOT_DIR = process.cwd();

const SKIP_DIR_NAMES = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.nuxt',
  '.output',
  '.vite',
  '.turbo',
  'uploads',
]);

const FILE_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.mjs',
  '.cjs',
  '.css',
  '.html',
]);

function shouldSkipDir(dirName) {
  return SKIP_DIR_NAMES.has(dirName);
}

function walk(dirPath, onFile) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (shouldSkipDir(entry.name)) continue;
      walk(fullPath, onFile);
      continue;
    }

    if (!entry.isFile()) continue;
    onFile(fullPath);
  }
}

function stripFile(filePath) {
  const ext = path.extname(filePath);
  if (!FILE_EXTENSIONS.has(ext)) return { changed: false };

  const original = fs.readFileSync(filePath, 'utf8');

  
  
  const stripped = strip(original, { preserveNewlines: true });

  if (stripped === original) return { changed: false };

  fs.writeFileSync(filePath, stripped, 'utf8');
  return { changed: true };
}

function main() {
  let changedCount = 0;
  let scannedCount = 0;

  walk(ROOT_DIR, (filePath) => {
    scannedCount += 1;
    const res = stripFile(filePath);
    if (res.changed) changedCount += 1;
  });

  console.log(`Scanned ${scannedCount} entries; updated ${changedCount} files.`);
}

main();
