import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const bucketName = import.meta.env.VITE_SUPABASE_IMAGE_BUCKET || "property-images";

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function uploadPropertyImage(file) {
  if (!file) {
    return "";
  }

  if (!supabase) {
    throw new Error("Supabase image storage is not configured.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Please select an image file.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image size must be 5 MB or less.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `properties/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(bucketName)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
  return data.publicUrl;
}
