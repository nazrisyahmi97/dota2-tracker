import { Suspense } from 'react';
import { getOfficialPatchList, getTopPickedHeroes, DotaPatchSummary } from '@/lib/dota';
import { getTopWeeklyRedditPosts } from '@/lib/reddit';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import SyncButton from '@/components/SyncButton';
import EmberBackground from '@/components/EmberBackground';
import SoundtrackPlayer from '@/components/SoundtrackPlayer';
import { Flame, Clock, ExternalLink, ShieldAlert, Sparkles, RefreshCw, Database, Trophy, Swords, TrendingUp, MessageSquare, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

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

  // 3. Fetch top picked heroes & top weekly r/DotA2 posts concurrently
  const [topHeroes, redditPosts] = await Promise.all([
    getTopPickedHeroes(8),
    getTopWeeklyRedditPosts(3),
  ]);

  const latestPatch = patches[0] || null;
  const recentPatches = patches.slice(1, 9);

  return (
    <div className="relative min-h-screen bg-[#0e1015] text-[#e1e6eb] font-sans">
      <EmberBackground />

      {/* Top Navigation */}
      <header className="border-b border-red-950/40 bg-[#12141c]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center shadow-lg shadow-red-900/30 hover:scale-105 transition">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-lg tracking-wider uppercase bg-gradient-to-r from-red-400 via-amber-200 to-red-500 bg-clip-text text-transparent">
                Aegis Update
              </span>
              <span className="text-xs text-red-400/80 font-mono block -mt-1">Dota 2 Changelog & Meta Tracker</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <SoundtrackPlayer />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs">
              <Database className="w-3 h-3 text-emerald-400" />
              Source: <span className="font-semibold text-white">{source}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 py-8 space-y-12">
        {/* Supabase Action Bar */}
        <div className="animate-fade-in-up p-4 rounded-xl border border-zinc-800 bg-[#14161f]/80 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" /> Database Synchronization
            </h3>
            <p className="text-xs text-zinc-400">
              Fetch the latest Dota 2 updates from Valve and store them permanently into your Supabase database.
            </p>
          </div>
          <Suspense fallback={<div className="text-xs text-zinc-500">Checking status...</div>}>
            <SyncButton />
          </Suspense>
        </div>

        {/* Hero Section: Latest Patch */}
        {latestPatch ? (
          <section
            style={{ animationDelay: '80ms' }}
            className="animate-fade-in-up relative overflow-hidden rounded-2xl border border-red-900/40 bg-gradient-to-b from-[#1c1820] to-[#12141a] p-8 shadow-2xl shadow-red-950/20 hover:border-red-700/60 transition duration-300"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
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

        {/* Top Picked Heroes in Current Patch (Dotabuff linked) */}
        {topHeroes.length > 0 && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  Top Picked Heroes
                  {latestPatch && (
                    <span className="text-sm font-normal text-zinc-400">
                      (Patch {latestPatch.patch_name} Meta)
                    </span>
                  )}
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Most popular heroes in public matchmaking with direct links to full Dotabuff analysis.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-md self-start sm:self-auto">
                <Swords className="w-3.5 h-3.5 text-red-400" />
                Real-time Match Stats
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {topHeroes.map((hero, index) => {
                const isHighWinrate = hero.winrate >= 50;
                const formattedPicks = hero.pub_pick >= 1000000 
                  ? `${(hero.pub_pick / 1000000).toFixed(1)}M` 
                  : `${(hero.pub_pick / 1000).toFixed(0)}K`;

                const attrColor = 
                  hero.primary_attr === 'str' ? 'border-red-500/50 text-red-400' :
                  hero.primary_attr === 'agi' ? 'border-emerald-500/50 text-emerald-400' :
                  hero.primary_attr === 'int' ? 'border-sky-500/50 text-sky-400' :
                  'border-amber-500/50 text-amber-400';

                return (
                  <div
                    key={hero.id}
                    style={{ animationDelay: `${120 + index * 55}ms` }}
                    className="animate-fade-in-up group relative flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800 bg-[#14161f]/80 hover:border-red-700/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-950/20 transition duration-300 shadow-lg"
                  >
                    {/* Top Image Banner with Rank Badge */}
                    <div className="relative w-full h-32 bg-zinc-950 overflow-hidden">
                      {hero.img ? (
                        <Image
                          src={hero.img}
                          alt={hero.localized_name}
                          fill
                          className="object-cover object-top group-hover:scale-105 transition duration-500"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-600">
                          No Image
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#14161f] via-transparent to-black/40" />

                      {/* Rank Badge */}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur border border-white/10 text-xs font-bold text-amber-300 font-mono">
                        #{index + 1}
                      </div>

                      {/* Attribute Badge */}
                      <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur border text-[10px] font-mono uppercase font-bold ${attrColor}`}>
                        {hero.primary_attr}
                      </div>

                      {/* Hero Name overlay at bottom of banner */}
                      <div className="absolute bottom-2 left-3 right-3">
                        <h3 className="text-base font-bold text-white tracking-wide truncate group-hover:text-red-300 transition">
                          {hero.localized_name}
                        </h3>
                      </div>
                    </div>

                    {/* Stats & Dotabuff Link */}
                    <div className="p-3.5 space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">Picks</span>
                          <span className="font-mono font-bold text-zinc-200">{formattedPicks}</span>
                        </div>
                        <div className="bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">Win Rate</span>
                          <span className={`font-mono font-bold inline-flex items-center gap-1 ${isHighWinrate ? 'text-emerald-400' : 'text-zinc-400'}`}>
                            <TrendingUp className="w-3 h-3" />
                            {hero.winrate}%
                          </span>
                        </div>
                      </div>

                      <a
                        href={hero.dotabuff_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-1.5 px-3 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        Dotabuff Profile
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
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
            {recentPatches.map((patch, idx) => {
              const releaseDate = new Date(patch.patch_timestamp * 1000).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={patch.patch_number}
                  style={{ animationDelay: `${200 + idx * 45}ms` }}
                  className="animate-fade-in-up group relative flex flex-col justify-between p-5 rounded-xl border border-zinc-800/80 bg-[#14161f]/60 hover:bg-[#181b26] hover:border-red-900/50 hover:-translate-y-1 transition duration-200"
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

        {/* Community Buzz: Top 3 Weekly Posts from r/DotA2 */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-500" />
                Top r/DotA2 Posts (Past 7 Days)
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Most popular community posts and discussions from the past week on r/DotA2.
              </p>
            </div>
            <a
              href="https://www.reddit.com/r/DotA2/top/?t=week"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-orange-950/40 hover:bg-orange-900/60 border border-orange-800/40 text-orange-300 hover:text-white transition self-start sm:self-auto"
            >
              See more on r/DotA2
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {redditPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {redditPosts.map((post, idx) => {
                const postDate = post.published
                  ? new Date(post.published).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Recent';

                return (
                  <a
                    key={post.id || post.link}
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ animationDelay: `${260 + idx * 60}ms` }}
                    className="animate-fade-in-up group flex flex-col justify-between p-5 rounded-xl border border-zinc-800/80 bg-[#14161f]/70 hover:bg-[#191c28] hover:border-orange-700/50 hover:-translate-y-1 transition duration-200"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] text-zinc-500">
                        <span className="font-mono text-orange-400/90 truncate max-w-[140px]">
                          {post.author}
                        </span>
                        <span>{postDate}</span>
                      </div>
                      <h3 className="text-sm font-bold text-zinc-100 group-hover:text-orange-300 transition line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 mt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs font-medium text-orange-400 group-hover:text-orange-300">
                      <span>Open on Reddit</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <div className="p-6 rounded-xl border border-zinc-800/80 bg-[#14161f]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-zinc-400">
                Reddit posts are temporarily unavailable right now — visit the subreddit directly for the latest discussions.
              </p>
              <a
                href="https://www.reddit.com/r/DotA2/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition shrink-0"
              >
                Visit r/DotA2
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-zinc-900 bg-[#0b0c10] py-8 text-center text-xs text-zinc-500">
        <p>Aegis Update — Dota 2 is a registered trademark of Valve Corporation.</p>
        <p className="mt-1 text-zinc-600">Built with Next.js, Tailwind CSS, Supabase & OpenDota / Dotabuff.</p>
      </footer>
    </div>
  );
}
