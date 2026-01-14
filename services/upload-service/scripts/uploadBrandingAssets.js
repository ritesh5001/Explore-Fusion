/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

// Load env for ImageKit keys (prefer upload-service/.env, fall back to auth-service/.env)
try {
  // eslint-disable-next-line global-require
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch {
  // noop
}
try {
  // eslint-disable-next-line global-require
  require('dotenv').config({ path: path.join(__dirname, '..', '..', 'auth-service', '.env') });
} catch {
  // noop
}

const { getImagekit } = require('../config/imagekit');

const ROOT = path.join(__dirname, '..', '..', '..');
const DEFAULT_SOURCE_DIR = path.join(ROOT, 'client', 'public', 'branding');
const DEFAULT_TARGET_FOLDER = 'explore-fusion/branding';

const IGNORE = new Set(['.gitkeep', 'README.md']);

const mimeFromExt = (ext) => {
  switch (ext.toLowerCase()) {
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    case '.gif':
      return 'image/gif';
    case '.pdf':
      return 'application/pdf';
    case '.txt':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
};

const asDataUri = (filePath) => {
  const ext = path.extname(filePath);
  const mime = mimeFromExt(ext);
  const base64 = fs.readFileSync(filePath, { encoding: 'base64' });
  return `data:${mime};base64,${base64}`;
};

const listFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => !IGNORE.has(name))
    .map((name) => path.join(dir, name))
    .filter((p) => fs.statSync(p).isFile());
};

const parseArg = (name) => {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (!arg) return null;
  return arg.split('=').slice(1).join('=').trim() || null;
};

async function main() {
  const sourceDir = parseArg('source') || DEFAULT_SOURCE_DIR;
  const targetFolder = parseArg('target') || DEFAULT_TARGET_FOLDER;

  const files = listFiles(sourceDir);
  if (files.length === 0) {
    console.log(`No files found in: ${sourceDir}`);
    console.log('Add files to client/public/branding and re-run.');
    process.exit(0);
  }

  let imagekit;
  try {
    imagekit = getImagekit();
  } catch (err) {
    console.error(err?.message || err);
    console.log('\nCreate services/upload-service/.env with:');
    console.log('  IMAGEKIT_PUBLIC_KEY=...');
    console.log('  IMAGEKIT_PRIVATE_KEY=...');
    console.log('  IMAGEKIT_URL_ENDPOINT=...');
    process.exit(1);
  }

  console.log(`Uploading ${files.length} file(s) from:`);
  console.log(`- source: ${sourceDir}`);
  console.log(`- target: ${targetFolder}`);

  for (const filePath of files) {
    const fileName = path.basename(filePath);
    const dataUri = asDataUri(filePath);

    try {
      const res = await imagekit.upload({
        file: dataUri,
        fileName,
        folder: targetFolder,
        tags: ['branding'],
        customMetadata: {
          kind: 'branding',
          source: 'repo',
          sourcePath: `client/public/branding/${fileName}`,
          uploadedAt: new Date().toISOString(),
        },
      });

      console.log(`✓ ${fileName}`);
      console.log(`  url: ${res.url}`);
      console.log(`  fileId: ${res.fileId}`);
    } catch (err) {
      console.error(`✗ ${fileName}`);
      console.error(err?.message || err);
      process.exitCode = 1;
    }
  }

  if (process.exitCode) {
    console.log('Done with errors.');
  } else {
    console.log('Done.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
