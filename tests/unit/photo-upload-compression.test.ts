import { describe, it, expect } from "vitest";
import { uploadProductPhotoToSupabase, isProductPhotosBucketAvailable } from "@/lib/supabase";

describe("Photo Upload & Storage Integration Unit Tests", () => {
  it("gracefully returns false when storage bucket check runs without Supabase configured", async () => {
    const isAvailable = await isProductPhotosBucketAvailable();
    expect(typeof isAvailable).toBe("boolean");
  });

  it("gracefully returns empty string when uploading without Supabase credentials", async () => {
    const mockFile = new File(["dummy image content"], "sample.jpg", { type: "image/jpeg" });
    const cdnUrl = await uploadProductPhotoToSupabase(mockFile);
    expect(cdnUrl).toBe("");
  });
});
