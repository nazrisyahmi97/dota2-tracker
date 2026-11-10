'use client';

import { useState, useEffect } from 'react';
import { Database, RefreshCw, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SyncButton() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminSecret, setAdminSecret] = useState<string>('');
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if ?admin=SECRET is present in the URL or stored in session
    const paramSecret = searchParams.get('admin');
    const storedSecret = typeof window !== 'undefined' ? sessionStorage.getItem('dota_admin_secret') : null;

    if (paramSecret) {
      setIsAdmin(true);
      setAdminSecret(paramSecret);
      sessionStorage.setItem('dota_admin_secret', paramSecret);
    } else if (storedSecret) {
      setIsAdmin(true);
      setAdminSecret(storedSecret);
    }
  }, [searchParams]);

  const handleSync = async () => {
    setSyncing(true);
    setStatus(null);
    setIsError(false);

    try {
      const res = await fetch(`/api/sync-patches?secret=${encodeURIComponent(adminSecret)}`, {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        setStatus(data.message);
        router.refresh();
      } else {
        setIsError(true);
        setStatus(data.error || 'Sync failed.');
      }
    } catch {
      setIsError(true);
      setStatus('Network error connecting to API.');
    } finally {
      setSyncing(false);
    }
  };

  // If not admin, show a clean, read-only status badge (No button to spam)
  if (!isAdmin) {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/60 border border-zinc-800/80 px-3 py-1.5 rounded-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Auto-Sync Active (Every 12h)</span>
      </div>
    );
  }

  // Admin Mode unlocked
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <div className="flex items-center gap-2">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-semibold tracking-wide transition shadow-md shadow-red-900/30 disabled:opacity-50 cursor-pointer"
        >
          {syncing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Database className="w-3.5 h-3.5" />
          )}
          {syncing ? 'Syncing...' : 'Sync Now (Admin)'}
        </button>
        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400/90 font-mono">
          <ShieldCheck className="w-3.5 h-3.5" /> Admin
        </span>
      </div>

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
