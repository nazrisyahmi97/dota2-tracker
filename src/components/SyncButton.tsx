'use client';

import { useState } from 'react';
import { Database, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setSyncing(true);
    setStatus(null);
    setIsError(false);

    try {
      const res = await fetch('/api/sync-patches', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setStatus(data.message);
        router.refresh();
      } else {
        setIsError(true);
        setStatus(data.error || 'Failed to sync. Make sure Supabase keys are configured in .env.local!');
      }
    } catch {
      setIsError(true);
      setStatus('Network error connecting to API.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <button
        onClick={handleSync}
        disabled={syncing}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 border border-zinc-700/80 text-zinc-200 text-xs font-semibold tracking-wide transition shadow-sm disabled:opacity-50 cursor-pointer"
      >
        {syncing ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
        ) : (
          <Database className="w-3.5 h-3.5 text-emerald-400" />
        )}
        {syncing ? 'Syncing with Supabase...' : 'Sync to Supabase'}
      </button>

      {status && (
        <span
          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border ${
            isError
              ? 'bg-red-950/60 border-red-800 text-red-300'
              : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
          }`}
        >
          {isError ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          {status}
        </span>
      )}
    </div>
  );
}
