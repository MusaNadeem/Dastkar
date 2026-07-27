// Client-side image upload to the Supabase Storage 'product-images' bucket.
// Bucket is public-read; authenticated insert is allowed by the storage RLS policy.
import { supabase } from './supabaseClient.js';

export async function uploadImage(file) {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth?.user?.id || 'anon';
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${uid}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('product-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw new Error(error.message);
  return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
}
