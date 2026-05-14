/**
 * Uploads all 28 audio files to Cloudflare R2.
 *
 * Before running:
 *   1. Create an R2 bucket at dash.cloudflare.com → R2 → Create bucket
 *   2. Enable public access on the bucket (Settings → Public Access → Allow)
 *   3. Create an API token: Cloudflare dashboard → R2 → Manage R2 API Tokens
 *      with permission "Object Read & Write" scoped to your bucket
 *   4. Set these env vars (or create a .env file):
 *        R2_ACCOUNT_ID=your_account_id
 *        R2_ACCESS_KEY_ID=your_key_id
 *        R2_SECRET_ACCESS_KEY=your_secret
 *        R2_BUCKET=se-meditations
 *
 *   Run: node upload-audio.js
 */

require('dotenv').config({ path: '.env.local' });
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET) {
  console.error('Missing R2 environment variables. See instructions at top of this file.');
  process.exit(1);
}

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

const AUDIO_BASE = path.join(__dirname, '..');
const folders = [
  'Section_1/Lessons',
  'Section_1/Companions',
  'Section_2/Lessons',
  'Section_2/Companions',
];

async function uploadFile(localPath, key) {
  const body = fs.createReadStream(localPath);
  await s3.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    Body: body,
    ContentType: 'audio/mp4',
    CacheControl: 'public, max-age=31536000',
  }));
}

async function main() {
  let done = 0, failed = 0;
  const files = [];

  for (const folder of folders) {
    const dir = path.join(AUDIO_BASE, folder);
    if (!fs.existsSync(dir)) { console.warn(`Directory not found: ${dir}`); continue; }
    fs.readdirSync(dir)
      .filter(f => f.endsWith('.m4a'))
      .forEach(f => files.push({ local: path.join(dir, f), key: `${folder}/${f}` }));
  }

  console.log(`Uploading ${files.length} files to R2 bucket "${R2_BUCKET}"...\n`);

  for (const { local, key } of files) {
    process.stdout.write(`  ${path.basename(local)}... `);
    try {
      await uploadFile(local, key);
      console.log('✓');
      done++;
    } catch (err) {
      console.log(`✗ (${err.message})`);
      failed++;
    }
    console.log(`  [${done + failed}/${files.length}]`);
  }

  console.log(`\nDone: ${done} uploaded, ${failed} failed`);
  if (done > 0) {
    console.log(`\nSet this env var in Vercel:`);
    console.log(`  AUDIO_BASE_URL = https://pub-<hash>.r2.dev`);
    console.log(`  (find your public URL in the R2 bucket settings → Public Access)`);
  }
}

main().catch(console.error);
