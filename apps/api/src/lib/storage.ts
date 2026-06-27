import { Storage } from "@google-cloud/storage";

let _storage: Storage | null = null;

function getStorage(): Storage {
  if (!_storage) {
    const keyFile = process.env.GCP_KEY_FILE;
    if (!keyFile) throw new Error("GCP_KEY_FILE not set");
    _storage = new Storage({ keyFilename: keyFile, projectId: process.env.GCP_PROJECT_ID });
  }
  return _storage;
}

function getBucket() {
  const bucket = process.env.GCP_BUCKET;
  if (!bucket) throw new Error("GCP_BUCKET not set");
  return getStorage().bucket(bucket);
}

/** Returns a signed download URL valid for the given duration (default 1 hour). */
export async function getSignedDownloadUrl(fileKey: string, expiresInSeconds = 3600): Promise<string> {
  const [url] = await getBucket().file(fileKey).getSignedUrl({
    action: "read",
    expires: Date.now() + expiresInSeconds * 1000,
  });
  return url;
}

/** Uploads a Buffer to the bucket under the given key. Returns the fileKey. */
export async function uploadBuffer(fileKey: string, data: Buffer, contentType: string): Promise<string> {
  const file = getBucket().file(fileKey);
  await file.save(data, { contentType, resumable: false });
  return fileKey;
}
