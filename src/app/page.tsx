import { getOfficialPatchList, DotaPatchSummary } from '@/lib/dota';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import SyncButton from '@/components/SyncButton';
import { Flame, Clock, ExternalLink, ShieldAlert, Sparkles, RefreshCw, Database } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let patches: DotaPatchSummary[] = [];
  let source = 'Valve Official Feed';

  // 1. Try to load cached patches from Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('patches')
        .select('patch_number, patch_name, patch_timestamp')
        .order('patch_timestamp', { ascending: false })
        .limit(20);

      if (!error && data && data.length > 0) {
        patches = data;
        source = 'Supabase PostgreSQL';
      }
    } catch {
      // Fallback gracefully
    }
  }

  // 2. Fallback to live Valve feed if DB is empty or unconfigured
  if (patches.length === 0) {
    patches = await getOfficialPatchList();
    source = 'Valve Live Feed';
  }

  const latestPatch = patches[0] || null;
  const recentPatches = patches.slice(1, 13);

  return (
    <div className="min-h-screen bg-[#0e1015] text-[#e1e6eb] font-sans">
      {/* Top Navigation */}
      <header className="border-b border-red-950/40 bg-[#12141c]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-900/30">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-lg tracking-wider uppercase bg-gradient-to-r from-red-400 via-amber-200 to-red-500 bg-clip-text text-transparent">
                Aegis Update
              </span>
              <span className="text-xs text-red-400/80 font-mono block -mt-1">Dota 2 Changelog Tracker</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs">
              <Database className="w-3 h-3 text-emerald-400" />
              Source: <span className="font-semibold text-white">{source}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section: Latest Patch */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        {/* Supabase Action Bar */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-[#14161f]/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" /> Database Synchronization
            </h3>
            <p className="text-xs text-zinc-400">
              Fetch the latest Dota 2 updates from Valve and store them permanently into your Supabase database.
            </p>
          </div>
          <SyncButton />
        </div>

        {latestPatch ? (
          <section className="relative overflow-hidden rounded-2xl border border-red-900/40 bg-gradient-to-b from-[#1c1820] to-[#12141a] p-8 shadow-2xl shadow-red-950/20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Latest Official Release
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white flex items-center gap-3">
                  Patch {latestPatch.patch_name}
                </h1>
                <p className="text-zinc-400 flex items-center gap-2 text-sm font-medium">
                  <Clock className="w-4 h-4 text-zinc-500" />
                  Released on {new Date(latestPatch.patch_timestamp * 1000).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-zinc-300 max-w-xl text-sm leading-relaxed pt-2">
                  The latest balance tweaks, hero updates, and gameplay changelog directly synced from Valve&apos;s Dota 2 network.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`https://www.dota2.com/patches/${latestPatch.patch_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold text-sm transition shadow-lg shadow-red-900/40"
                >
                  View Official Notes
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </section>
        ) : (
          <div className="p-8 text-center bg-zinc-900/50 rounded-xl border border-zinc-800">
            <RefreshCw className="w-8 h-8 text-zinc-500 animate-spin mx-auto mb-3" />
            <p className="text-zinc-400">Loading Dota 2 patch list...</p>
          </div>
        )}

        {/* Patch History Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              Changelog History
            </h2>
            <span className="text-xs text-zinc-500 font-mono">
              Showing {recentPatches.length} recent releases
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentPatches.map((patch) => {
              const releaseDate = new Date(patch.patch_timestamp * 1000).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={patch.patch_number}
                  className="group relative flex flex-col justify-between p-5 rounded-xl border border-zinc-800/80 bg-[#14161f]/60 hover:bg-[#181b26] hover:border-red-900/50 transition duration-200"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400 group-hover:text-amber-400 group-hover:bg-amber-950/30 transition">
                        Dota 2
                      </span>
                      <span className="text-[11px] text-zinc-500">{releaseDate}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition">
                      Patch {patch.patch_name}
                    </h3>
                  </div>

                  <div className="pt-4 mt-4 border-t border-zinc-800/60 flex items-center justify-between">
                    <a
                      href={`https://www.dota2.com/patches/${patch.patch_number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-red-400 hover:text-red-300 font-medium inline-flex items-center gap-1"
                    >
                      Read notes <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-zinc-900 bg-[#0b0c10] py-8 text-center text-xs text-zinc-500">
        <p>Aegis Update — Dota 2 is a registered trademark of Valve Corporation.</p>
        <p className="mt-1 text-zinc-600">Built with Next.js, Tailwind CSS & Supabase.</p>
      </footer>
    </div>
  );
}
