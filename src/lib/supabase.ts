import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = 
  supabaseUrl.trim() !== "" && 
  supabaseAnonKey.trim() !== "" && 
  supabaseUrl !== "your-supabase-url" && 
  supabaseAnonKey !== "your-supabase-anon-key";

// Only create the client if credentials are provided
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Uploads a local PC image file directly to Supabase Storage bucket ('product-photos')
 * and returns a public CDN URL.
 */
export async function uploadProductPhotoToSupabase(file: File): Promise<string> {
  if (!isSupabaseConfigured || !supabase) return "";
  try {
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = `${fileName}`;

    // Attempt upload to Supabase Storage bucket 'product-photos'
    let { data, error } = await supabase.storage
      .from("product-photos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true
      });

    // If bucket not found, attempt auto-creation
    if (error && (error.message.includes("not found") || error.message.includes("Bucket"))) {
      try {
        await supabase.storage.createBucket("product-photos", { public: true });
        const retryRes = await supabase.storage
          .from("product-photos")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true
          });
        data = retryRes.data;
        error = retryRes.error;
      } catch (bErr) {}
    }

    if (error) {
      // Supabase storage bucket not configured or permissions disabled, fallback to compressed WebP
      return "";
    }

    const { data: publicUrlData } = supabase.storage
      .from("product-photos")
      .getPublicUrl(filePath);

    return publicUrlData?.publicUrl || "";
  } catch (err) {
    return "";
  }
}

/**
 * Client-side Canvas image compressor (converts heavy 3MB Base64 files to ~40KB WebP)
 */
export function compressImageFile(file: File, maxWidth = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = document.createElement("img");
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/webp", quality));
        } else {
          resolve((e.target?.result as string) || "");
        }
      };
      img.onerror = () => resolve((e.target?.result as string) || "");
      img.src = (e.target?.result as string) || "";
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}
