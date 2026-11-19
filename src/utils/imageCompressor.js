import imageCompression from 'browser-image-compression';

/**
 * Compress an image File on the client side using browser-image-compression (WebWorkers)
 * before uploading to backend/cloud storage.
 */
export async function compressImageFile(file, options = {}) {
  if (!file || !file.type?.startsWith('image/') || file.size < 300 * 1024) {
    return file;
  }

  const defaultOpts = {
    maxSizeMB: options.maxSizeMB || 0.8,
    maxWidthOrHeight: options.maxWidthOrHeight || 1280,
    useWebWorker: options.useWebWorker ?? true,
    initialQuality: options.initialQuality || 0.85,
    preserveExif: false,
  };

  try {
    const compressedFile = await imageCompression(file, defaultOpts);
    return new File([compressedFile], file.name, {
      type: compressedFile.type || 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch (err) {
    console.warn('[ImageCompressor] Compression failed, falling back to original:', err);
    return file;
  }
}

/**
 * Compress an array of image Files concurrently on client side before upload.
 */
export async function compressMultipleImageFiles(files, options = {}) {
  const fileArray = Array.from(files);
  const compressPromises = fileArray.map((f) => compressImageFile(f, options));
  return Promise.all(compressPromises);
}
