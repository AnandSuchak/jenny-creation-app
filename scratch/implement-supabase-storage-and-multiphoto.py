import re

path = 'src/app/page.tsx'
content = open(path, encoding='utf-8').read()

# 1. Add uploadProductPhotoToSupabase and compressImageFile to supabase imports
old_supabase_import = 'import { supabase, isSupabaseConfigured } from "./lib/supabase";'
new_supabase_import = 'import { supabase, isSupabaseConfigured, uploadProductPhotoToSupabase, compressImageFile } from "./lib/supabase";'

if old_supabase_import in content:
    content = content.replace(old_supabase_import, new_supabase_import)

# 2. Add isUploadingPhoto state in Dashboard component
state_anchor = 'const [isLowDataMode, setIsLowDataMode] = useState<boolean>(true);'
new_states = 'const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);\n  ' + state_anchor

if 'const [isUploadingPhoto,' not in content:
    content = content.replace(state_anchor, new_states)

# 3. Upgrade handleLocalImageUpload to support multiple files, Supabase Storage, and WebP compression
old_handler = '''  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.name.match(/\\.(jpg|jpeg|png|webp|avif|gif|svg)$/i)) {
      alert("Validation Error: Please select a valid image file (JPG, PNG, WebP, GIF, SVG, or AVIF).");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setNewProductPhotos(base64String);
    };
    reader.readAsDataURL(file);
  };'''

new_handler = '''  const handleLocalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => 
      file.type.startsWith("image/") || file.name.match(/\\.(jpg|jpeg|png|webp|avif|gif|svg)$/i)
    );

    if (validFiles.length === 0) {
      alert("Validation Error: Please select valid image files (JPG, PNG, WebP, GIF, SVG, or AVIF).");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of validFiles) {
        // 1. Try direct upload to Supabase Storage bucket ('product-photos')
        let url = await uploadProductPhotoToSupabase(file);
        // 2. Fallback to client-side WebP compression (~40KB) if Supabase bucket isn't ready
        if (!url) {
          url = await compressImageFile(file);
        }
        if (url) uploadedUrls.push(url);
      }

      if (uploadedUrls.length > 0) {
        const existingUrls = parseProductPhotoUrls(newProductPhotos);
        const combined = Array.from(new Set([...existingUrls, ...uploadedUrls]));
        setNewProductPhotos(combined.join("\\n"));
      }
    } catch (err) {
      console.warn("Photo upload process notice:", err);
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = "";
    }
  };'''

if old_handler in content:
    content = content.replace(old_handler, new_handler)

# 4. Multi-Photo management UI in Product Modal
old_photo_ui = '''              {/* Photo URLs - Always visible */}
              <div className="relative">
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  Photo URL(s) <span className="text-[10px] text-zinc-500 font-normal">(JPG or PNG format)</span>
                </label>
                <div className="space-y-2">
                  {newProductPhotos.trim().startsWith("data:image/") ? (
                    <div className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 ${isDark ? "bg-zinc-950 border-emerald-500/40" : "bg-emerald-50/50 border-emerald-200"}`}>
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img 
                          src={newProductPhotos} 
                          alt="Local preview" 
                          className="h-10 w-10 object-cover rounded-lg border border-emerald-500/30 shrink-0" 
                        />
                        <div className="overflow-hidden">
                          <span className={`text-xs font-bold block truncate ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                            ✓ Image Loaded from Local Drive
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono block truncate">
                            Base64 Encoded Image Data
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNewProductPhotos("")}
                        className="text-xs text-rose-500 hover:text-rose-400 font-semibold px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 transition duration-150 shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <input 
                      type="text" 
                      placeholder="e.g. /gift_box_2jar.jpg or paste URL"
                      value={newProductPhotos}
                      onChange={e => setNewProductPhotos(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${inputClass}`}
                    />
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAssetSelector(!showAssetSelector)}
                      className={`w-full py-2 px-3 border rounded-lg text-xs font-semibold transition duration-150 flex items-center justify-center gap-1.5 select-none ${
                        showAssetSelector
                          ? "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-500"
                          : (isDark ? "bg-zinc-950 hover:bg-zinc-850 border-zinc-808 hover:border-zinc-700 text-indigo-400 hover:text-indigo-300" : "bg-slate-50 hover:bg-slate-100 border-slate-205 hover:border-slate-300 text-indigo-650 hover:text-indigo-700")
                      }`}
                    >
                      <Image className="h-4 w-4" /> Preset Path
                    </button>
                    <label
                      className={`w-full py-2 px-3 border rounded-lg text-xs font-semibold transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                        isDark ? "bg-zinc-950 hover:bg-zinc-850 border-zinc-808 hover:border-zinc-700 text-emerald-450 hover:text-emerald-400" : "bg-slate-50 hover:bg-slate-100 border-slate-205 hover:border-slate-300 text-emerald-600 hover:text-emerald-700"
                      }`}
                    >
                      <Plus className="h-4 w-4" /> Local Drive
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLocalImageUpload}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>'''

new_photo_ui = '''              {/* Photo URLs - Multi-photo & Supabase Storage Support */}
              <div className="relative">
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  Product Photos <span className="text-[10px] text-zinc-500 font-normal">(Multiple URLs or PC Files)</span>
                </label>
                <div className="space-y-2">
                  {/* Multi-photo Thumbnails Gallery */}
                  {parseProductPhotoUrls(newProductPhotos).length > 0 && (
                    <div className="flex flex-wrap gap-2 p-2 rounded-xl border border-dashed border-indigo-500/30 bg-indigo-500/5 max-h-36 overflow-y-auto">
                      {parseProductPhotoUrls(newProductPhotos).map((url, pIdx) => (
                        <div key={pIdx} className="relative group/thumb rounded-lg overflow-hidden border border-zinc-700/40 w-14 h-14 bg-zinc-900 shrink-0">
                          {url.startsWith("http") || url.startsWith("/") || url.startsWith("data:") ? (
                            <img src={url} alt={`Photo ${pIdx+1}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] font-mono text-zinc-500">URL</div>
                          )}
                          {pIdx === 0 && (
                            <span className="absolute top-0.5 left-0.5 bg-indigo-600 text-white text-[7px] font-black px-1 rounded">Main</span>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const urls = parseProductPhotoUrls(newProductPhotos);
                              urls.splice(pIdx, 1);
                              setNewProductPhotos(urls.join("\\n"));
                            }}
                            className="absolute top-0.5 right-0.5 p-0.5 bg-rose-600 text-white rounded-full opacity-0 group-hover/thumb:opacity-100 transition duration-150"
                            title="Remove Photo"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <textarea 
                    rows={2}
                    placeholder="Enter/Paste image URLs (one per line)..."
                    value={newProductPhotos}
                    onChange={e => setNewProductPhotos(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none text-xs font-mono ${inputClass}`}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAssetSelector(!showAssetSelector)}
                      className={`w-full py-2 px-3 border rounded-lg text-xs font-semibold transition duration-150 flex items-center justify-center gap-1.5 select-none ${
                        showAssetSelector
                          ? "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-500"
                          : (isDark ? "bg-zinc-950 hover:bg-zinc-850 border-zinc-808 hover:border-zinc-700 text-indigo-400 hover:text-indigo-300" : "bg-slate-50 hover:bg-slate-100 border-slate-205 hover:border-slate-300 text-indigo-650 hover:text-indigo-700")
                      }`}
                    >
                      <Image className="h-4 w-4" /> Preset Path
                    </button>
                    <label
                      className={`w-full py-2 px-3 border rounded-lg text-xs font-semibold transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer select-none ${
                        isUploadingPhoto ? "opacity-50 cursor-wait" : ""
                      } ${
                        isDark ? "bg-zinc-950 hover:bg-zinc-850 border-zinc-808 hover:border-zinc-700 text-emerald-450 hover:text-emerald-400" : "bg-slate-50 hover:bg-slate-100 border-slate-205 hover:border-slate-300 text-emerald-600 hover:text-emerald-700"
                      }`}
                    >
                      <Plus className="h-4 w-4" /> {isUploadingPhoto ? "Uploading..." : "Upload PC Image(s)"}
                      <input 
                        type="file" 
                        multiple
                        accept="image/*" 
                        disabled={isUploadingPhoto}
                        onChange={handleLocalImageUpload}
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>'''

if old_photo_ui in content:
    content = content.replace(old_photo_ui, new_photo_ui)

open(path, 'w', encoding='utf-8').write(content)
print("Updated page.tsx with Supabase Storage upload & multi-photo gallery support successfully!")
