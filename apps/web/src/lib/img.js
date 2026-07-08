// Placeholder photography. No image-gen tool is available in this environment, so per the
// design skill's asset priority we fall back to Picsum with descriptive seeds. These are
// stand-ins for real handmade-product photography and should be replaced before launch.
export const img = (seed, w, h) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
