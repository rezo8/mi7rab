/**
 * Upload images from /image_sources/{door} to GCS as WebP (original dimensions, no resize).
 *
 * Usage (from apps/api/):
 *   GCP_KEY_FILE=gcp-key.json GCP_BUCKET=mi7rab_resources GCP_PROJECT_ID=mi7rab \
 *     pnpm upload:images [door]
 *
 * door defaults to "knowledge". Images are stored as:
 *   {door}/{slug}.webp
 *
 * Images are converted to WebP for compression but NOT resized — the frontend handles
 * display sizing (arch clipPath for mini cards, object-fit: contain for focus view).
 *
 * PDFs: first page extracted via ImageMagick (`magick`), must be installed.
 *   brew install imagemagick
 *
 * Low-res warning: sources under 400px on either side are flagged (blurry at focus view).
 *
 * Prints a JSON mapping { originalFile: fileKey } at the end —
 * paste these fileKey values into your seed JSON as cover_image_key.
 */

import "dotenv/config";
import { readdir, mkdir, rm } from "node:fs/promises";
import { join, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import sharp from "sharp";
import { Storage } from "@google-cloud/storage";

const execFileAsync = promisify(execFile);

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".tiff", ".bmp", ".JPG", ".JPEG", ".PNG", ".WEBP"]);
const PDF_EXTS   = new Set([".pdf", ".PDF"]);

const WEBP_QUALITY = 85;
const LOW_RES_THRESHOLD = 400; // warn if source is under this on either dimension

const REPO_ROOT = fileURLToPath(new URL("../../../..", import.meta.url));

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function imageToWebp(inputPath: string): Promise<{ data: Buffer; width: number; height: number }> {
  const img = sharp(inputPath, { animated: false });
  const meta = await img.metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;

  const data = await img
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();

  return { data, width: w, height: h };
}

async function pdfToWebp(inputPath: string): Promise<{ data: Buffer; width: number; height: number }> {
  const tmpDir = join(tmpdir(), `mihrab-pdf-${Date.now()}`);
  await mkdir(tmpDir, { recursive: true });
  const tmpPng = join(tmpDir, "page.png");

  try {
    // Extract first page at 150 DPI as PNG via ImageMagick
    await execFileAsync("magick", [
      "-density", "150",
      `${inputPath}[0]`,   // [0] = first page only
      "-background", "white",
      "-alpha", "remove",
      tmpPng,
    ]);
    const result = await imageToWebp(tmpPng);
    return result;
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}

async function main() {
  const door = process.argv[2] ?? "knowledge";
  const imageSourcesDir = join(REPO_ROOT, "image_sources", door);

  const keyFile = process.env.GCP_KEY_FILE;
  const bucket  = process.env.GCP_BUCKET;
  const project = process.env.GCP_PROJECT_ID;

  if (!keyFile || !bucket || !project) {
    console.error("Missing GCP_KEY_FILE, GCP_BUCKET, or GCP_PROJECT_ID");
    process.exit(1);
  }

  const storage = new Storage({ keyFilename: keyFile, projectId: project });
  const gcs = storage.bucket(bucket);

  const entries = await readdir(imageSourcesDir);
  const imageFiles = entries.filter((f) => IMAGE_EXTS.has(extname(f)));
  const pdfFiles   = entries.filter((f) => PDF_EXTS.has(extname(f)));
  const allFiles   = [...imageFiles, ...pdfFiles];

  console.log(`\nSource: image_sources/${door}/`);
  console.log(`Target: gs://${bucket}/${door}/*.webp`);
  console.log(`Mode:   WebP conversion at original dimensions (no resize)\n`);

  const mapping: Record<string, { fileKey: string; dimensions: string }> = {};
  const warnings: string[] = [];
  const failed: string[] = [];

  for (const file of allFiles) {
    const isPdf = PDF_EXTS.has(extname(file));
    const slug = slugify(basename(file, extname(file)));
    const fileKey = `${door}/${slug}.webp`;
    const inputPath = join(imageSourcesDir, file);

    process.stdout.write(`  ${file}${isPdf ? " [PDF→img]" : ""} → ${fileKey} … `);

    try {
      const { data, width, height } = isPdf
        ? await pdfToWebp(inputPath)
        : await imageToWebp(inputPath);

      if (width < LOW_RES_THRESHOLD || height < LOW_RES_THRESHOLD) {
        warnings.push(`${file}: ${width}×${height} — low res, may look soft at focus size`);
      }

      await gcs.file(fileKey).save(data, { contentType: "image/webp", resumable: false });
      mapping[file] = { fileKey, dimensions: `${width}×${height}` };
      console.log(`✓ (${width}×${height} → ${(data.length / 1024).toFixed(0)} KB)`);
    } catch (err) {
      failed.push(file);
      console.log(`✗ ${(err as Error).message}`);
    }
  }

  if (warnings.length > 0) {
    console.warn("\n⚠  Low-resolution sources:");
    for (const w of warnings) console.warn(`   ${w}`);
  }

  console.log("\n--- file key mapping (paste into seed JSON as cover_image_key) ---");
  console.log(JSON.stringify(mapping, null, 2));

  if (failed.length > 0) {
    console.warn(`\n✗  ${failed.length} failed: ${failed.join(", ")}`);
    process.exit(1);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
