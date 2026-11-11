'use client';

import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';

export default function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const storageKey = `dota2_visited_${todayKey}`;
    const alreadyCounted = typeof window !== 'undefined' && sessionStorage.getItem(storageKey);

    const trackVisit = async () => {
      try {
        const res = await fetch('/api/visits', {
          method: alreadyCounted ? 'GET' : 'POST',
        });
        const data = await res.json();
        if (typeof data.count === 'number') {
          setCount(data.count);
          if (!alreadyCounted) {
            sessionStorage.setItem(storageKey, '1');
          }
        }
      } catch {
        // Fail silently
      }
    };

    trackVisit();
  }, []);

  if (count === null) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900/70 border border-zinc-800/80 px-3 py-1.5 rounded-lg">
      <Eye className="w-3.5 h-3.5 text-amber-400" />
      <span className="font-mono font-bold text-white">{count.toLocaleString()}</span>
      <span>{count === 1 ? 'visit today' : 'visits today'}</span>
    </span>
  );
}
