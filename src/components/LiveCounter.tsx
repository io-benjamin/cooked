'use client';

import { useStats } from '@/hooks/useStats';

export function LiveCounter() {
  const { stats, loading } = useStats();

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-white/70">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
        </span>
        Loading...
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-white/70">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
      </span>
      <span className="font-semibold text-white">{stats.today.toLocaleString()}</span> people checked today
    </div>
  );
}
