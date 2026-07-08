// Client-side watermark + compression applied at upload time (CLAUDE.md §2, Sprint 1).
// Draws the image to a canvas, overlays a text watermark, exports a compressed blob.
// TODO (Sprint 1): implement. Signature kept stable so callers don't change.
export async function watermarkAndCompress(file, { text = 'Marketplace', quality = 0.8 } = {}) {
  // 1. load file into an <img>/ImageBitmap
  // 2. draw onto a canvas, overlay `text` (semi-transparent, bottom-right)
  // 3. canvas.toBlob(..., 'image/jpeg', quality)
  // 4. return the Blob for upload to Supabase Storage
  throw new Error('watermarkAndCompress not implemented');
}
