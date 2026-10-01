import re

path = 'src/app/page.tsx'
content = open(path, encoding='utf-8').read()

# 1. Add Zap to lucide-react imports
if 'Zap,' not in content:
    content = content.replace('import { \n  Package,', 'import { \n  Zap,\n  Shield,\n  Package,')
    content = content.replace('import {\n  Package,', 'import {\n  Zap,\n  Shield,\n  Package,')

# 2. Add state variables inside Dashboard component
state_anchor = 'const [connectionStatus, setConnectionStatus] = useState<"synced" | "connecting" | "offline">("synced");'
new_states = '''const [isLowDataMode, setIsLowDataMode] = useState<boolean>(true);
  const [isManualSyncing, setIsManualSyncing] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("Just now");
  const [backupSnapshots, setBackupSnapshots] = useState<any[]>([]);
  ''' + state_anchor

if 'const [isLowDataMode,' not in content:
    content = content.replace(state_anchor, new_states)

# 3. Add low data & backup initialization in useEffect
init_anchor = 'loadData();\n    // Trigger real-time background database sync'
new_init = '''setIsLowDataMode(localDB.isLowDataMode());
    try {
      localDB.runAutomatedDailyBackup();
      setBackupSnapshots(localDB.getBackupSnapshots());
    } catch (err) {
      console.warn("Backup engine init warning:", err);
    }
    ''' + init_anchor

if 'setIsLowDataMode(localDB.isLowDataMode());' not in content:
    content = content.replace(init_anchor, new_init)

# 4. Change 5-second polling interval to 60-second smart interval
content = content.replace('}, 5000);', '}, 60000); // Smart 60-second bandwidth-saving interval')

# 5. Add Header controls (Low Data Mode toggle & Sync Now button)
header_anchor = '<button \n              onClick={() => setIsArchiveModalOpen(true)}'
if '<button \n              onClick={() => setIsArchiveModalOpen(true)}' not in content:
    header_anchor = 'onClick={() => setIsArchiveModalOpen(true)}'

header_controls = '''{/* ⚡ Low Data Mode Toggle (ON by default) */}
            <button
              type="button"
              onClick={() => {
                const nextMode = !isLowDataMode;
                setIsLowDataMode(nextMode);
                localDB.setLowDataMode(nextMode);
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition duration-150 cursor-pointer ${
                isLowDataMode 
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20"
              }`}
              title="Toggle Low Data Mode (Hide heavy base64 photos to save Vercel data)"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Low Data: {isLowDataMode ? "ON ⚡" : "OFF"}</span>
            </button>

            {/* 🔄 Instant Manual Sync Button */}
            <button
              type="button"
              onClick={async () => {
                setIsManualSyncing(true);
                if (isSupabaseConfigured) {
                  await localDB.syncFromSupabase();
                  loadData();
                } else {
                  await localDB.syncFromServer();
                  loadData();
                }
                setIsManualSyncing(false);
                setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
              }}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition duration-150 cursor-pointer ${
                isDark ? "bg-indigo-950/40 border-indigo-500/30 text-indigo-400 hover:bg-indigo-900/50" : "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
              }`}
              title={`Trigger instant database sync with Supabase Cloud (Last: ${lastSyncedTime})`}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isManualSyncing ? "animate-spin text-indigo-500" : ""}`} />
              <span>{isManualSyncing ? "Syncing..." : "Sync Now"}</span>
            </button>

            <button 
              onClick={() => setIsArchiveModalOpen(true)}'''

if 'Low Data:' not in content:
    content = content.replace('<button \n              onClick={() => setIsArchiveModalOpen(true)}', header_controls)
    if 'Low Data:' not in content:
      content = content.replace('onClick={() => setIsArchiveModalOpen(true)}', 'onClick={() => setIsArchiveModalOpen(true)}')

# 6. Sticky Header & High Contrast inputs for Variant Table in Product Modal
old_table_header = '<tr className={`border-b text-[10px] font-semibold uppercase tracking-wider ${isDark ? "bg-zinc-900 text-zinc-400 border-zinc-800" : "bg-slate-100 text-slate-500 border-slate-200"}`}>'
new_table_header = '<tr className={`sticky top-0 z-20 border-b-2 text-[10px] font-bold uppercase tracking-wider shadow-xs ${isDark ? "bg-zinc-900 text-zinc-300 border-zinc-700" : "bg-slate-100 text-slate-700 border-slate-300"}`}>'

content = content.replace(old_table_header, new_table_header)

old_variant_input = 'className={`w-full px-2 py-1 border rounded focus:outline-none font-mono text-xs ${inputClass}`}'
new_variant_input = 'className={`w-full px-2 py-1.5 border-2 rounded-lg focus:outline-none font-mono text-xs font-bold shadow-xs ${isDark ? "bg-zinc-950 border-zinc-700 text-zinc-100 focus:border-indigo-500" : "bg-white border-slate-300 text-slate-900 focus:border-indigo-500"}`}'

content = content.replace(old_variant_input, new_variant_input)

# 7. Add 3-Day Rolling Backup Manager to System Setup Tab
setup_grid_end = '{additives.length === 0 && (\n                    <div className="text-center text-zinc-550 text-xs italic py-4">No additives created</div>\n                  )}\n                </div>\n              </div>\n            </div>\n          </div>\n        )}'

backup_hub_code = '''{additives.length === 0 && (
                    <div className="text-center text-zinc-550 text-xs italic py-4">No additives created</div>
                  )}
                </div>
              </div>
            </div>

            {/* 💾 3-Day Rolling Backup Hub */}
            <div className={`col-span-1 md:col-span-2 xl:col-span-4 ${cardClass} p-6 border shadow-xl`}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-zinc-808/30">
                <div>
                  <h3 className={`font-bold text-lg flex items-center gap-2 ${isDark ? "text-zinc-100" : "text-zinc-800"}`}>
                    <Database className="h-5 w-5 text-indigo-500" />
                    <span>3-Day Rolling Backup Manager (Automated FIFO)</span>
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Automatically maintains 3 daily rolling snapshots of invoices and catalog data. Oldest snapshots are automatically purged when Day 4 is created.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const snap = localDB.createBackupSnapshot();
                    setBackupSnapshots(localDB.getBackupSnapshots());
                    alert(`✅ Backup snapshot created for ${snap.date_str} (${snap.size_kb} KB)!`);
                  }}
                  className="px-3.5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition duration-150 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Create Snapshot Now
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {backupSnapshots.length === 0 ? (
                  <div className="col-span-3 text-center py-6 text-xs text-zinc-500 italic">
                    No active rolling backups found. Click "Create Snapshot Now" or wait for daily automated trigger.
                  </div>
                ) : (
                  backupSnapshots.map((snap: any, sIdx: number) => (
                    <div 
                      key={snap.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                        isDark ? "bg-zinc-950/40 border-zinc-808" : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-black font-mono text-indigo-500">
                            📅 {snap.date_str} {sIdx === 0 && "(Latest)"}
                          </span>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-500/10 text-zinc-500">
                            {snap.size_kb} KB
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-550 dark:text-zinc-400">
                          <strong>{snap.invoices_count}</strong> Invoices • <strong>{snap.catalog_count}</strong> Catalog Items
                        </p>
                        <p className="text-[9px] font-mono text-zinc-500 mt-1">
                          Created: {new Date(snap.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 border-t pt-2.5 border-dashed border-zinc-808/30">
                        <button
                          type="button"
                          onClick={() => {
                            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snap.data, null, 2));
                            const downloadAnchor = document.createElement("a");
                            downloadAnchor.setAttribute("href", dataStr);
                            downloadAnchor.setAttribute("download", `jenny_backup_${snap.date_str}.json`);
                            document.body.appendChild(downloadAnchor);
                            downloadAnchor.click();
                            downloadAnchor.remove();
                          }}
                          className="flex-1 py-1.5 text-[11px] font-bold border rounded-lg text-center transition cursor-pointer text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/10"
                        >
                          📥 Download JSON
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Restore backup from ${snap.date_str}? Current unbacked data will be overwritten.`)) {
                              const ok = localDB.restoreBackupSnapshot(snap.id);
                              if (ok) {
                                loadData();
                                alert(`Snapshot from ${snap.date_str} restored successfully!`);
                              }
                            }
                          }}
                          className="px-3 py-1.5 text-[11px] font-bold border rounded-lg text-center transition cursor-pointer text-amber-500 border-amber-500/20 hover:bg-amber-500/10"
                        >
                          🔄 Restore
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}'''

if '3-Day Rolling Backup Manager' not in content:
    content = content.replace(setup_grid_end, backup_hub_code)

open(path, 'w', encoding='utf-8').write(content)
print("Updated page.tsx with Data, UI, and Backup Manager features successfully!")
