/**
 * Upload and resize images from /image_sources to GCS.
 *
 * Usage:
 *   GCP_KEY_FILE=gcp-key.json GCP_BUCKET=mi7rab_resources GCP_PROJECT_ID=mi7rab \
 *     pnpm upload:images [door]
 *
 * door defaults to "knowledge". Images are stored as:
 *   {door}/{slug}.webp
 *
 * Prints a JSON mapping { originalFile: fileKey } at the end —
 * paste these fileKey values into your seed JSON as cover_image_key.
 *
 * PDFs are skipped (convert to image first with e.g. `convert -density 150 file.pdf file.jpg`).
 */

import "dotenv/config";
import { readdir } from "node:fs/promises";
import { join, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { Storage } from "@google-cloud/storage";

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".tiff", ".bmp", ".JPG", ".JPEG"]);
const PDF_EXTS   = new Set([".pdf", ".PDF"]);

// Arch proportions: 100×197 SVG units → 1:1.97 ≈ 1:2
const TARGET_W = 600;
const TARGET_H = 1200;
const WEBP_QUALITY = 85;

const REPO_ROOT = fileURLToPath(new URL("../../../../..", import.meta.url));
const IMAGE_SOURCES_DIR = join(REPO_ROOT, "image_sources");

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function processImage(inputPath: string): Promise<Buffer> {
  return sharp(inputPath, { animated: false })
    .resize(TARGET_W, TARGET_H, {
      fit: "cover",
      position: "centre",
    })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

async function main() {
  const door = process.argv[2] ?? "knowledge";

  const keyFile = process.env.GCP_KEY_FILE;
  const bucket  = process.env.GCP_BUCKET;
  const project = process.env.GCP_PROJECT_ID;

  if (!keyFile || !bucket || !project) {
    console.error("Missing GCP_KEY_FILE, GCP_BUCKET, or GCP_PROJECT_ID");
    process.exit(1);
  }

  const storage = new Storage({ keyFilename: keyFile, projectId: project });
  const gcs = storage.bucket(bucket);

  const entries = await readdir(IMAGE_SOURCES_DIR);
  const imageFiles = entries.filter((f) => IMAGE_EXTS.has(extname(f)));
  const pdfFiles   = entries.filter((f) => PDF_EXTS.has(extname(f)));

  if (pdfFiles.length > 0) {
    console.warn("\n⚠  PDFs skipped (convert to image first):");
    for (const f of pdfFiles) console.warn(`   ${f}`);
    console.warn("   e.g. convert -density 150 file.pdf file.jpg\n");
  }

  console.log(`Processing ${imageFiles.length} images → gs://${bucket}/${door}/*.webp\n`);

  const mapping: Record<string, string> = {};
  const failed: string[] = [];

  for (const file of imageFiles) {
    const slug = slugify(basename(file, extname(file)));
    const fileKey = `${door}/${slug}.webp`;
    const inputPath = join(IMAGE_SOURCES_DIR, file);

    process.stdout.write(`  ${file} → ${fileKey} … `);

    try {
      const data = await processImage(inputPath);
      await gcs.file(fileKey).save(data, { contentType: "image/webp", resumable: false });
      mapping[file] = fileKey;
      console.log(`✓ (${(data.length / 1024).toFixed(0)} KB)`);
    } catch (err) {
      failed.push(file);
      console.log(`✗ ${(err as Error).message}`);
    }
  }

  console.log("\n--- file key mapping (paste into seed JSON) ---");
  console.log(JSON.stringify(mapping, null, 2));

  if (failed.length > 0) {
    console.warn(`\n⚠  ${failed.length} failed: ${failed.join(", ")}`);
    process.exit(1);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
