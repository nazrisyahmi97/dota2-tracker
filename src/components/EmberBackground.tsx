export default function EmberBackground() {
  const embers = [
    { left: '5%', delay: '-2s', duration: '9s', size: 'w-2 h-2', color: 'bg-red-500 shadow-[0_0_10px_#ef4444]' },
    { left: '12%', delay: '-6s', duration: '11s', size: 'w-1.5 h-1.5', color: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' },
    { left: '20%', delay: '-1s', duration: '13s', size: 'w-2.5 h-2.5', color: 'bg-orange-500 shadow-[0_0_12px_#f97316]' },
    { left: '28%', delay: '-8s', duration: '10s', size: 'w-1.5 h-1.5', color: 'bg-red-400 shadow-[0_0_8px_#f87171]' },
    { left: '36%', delay: '-4s', duration: '12s', size: 'w-2 h-2', color: 'bg-amber-300 shadow-[0_0_10px_#fcd34d]' },
    { left: '44%', delay: '-9s', duration: '9.5s', size: 'w-1.5 h-1.5', color: 'bg-red-500 shadow-[0_0_10px_#ef4444]' },
    { left: '52%', delay: '-3s', duration: '14s', size: 'w-2 h-2', color: 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' },
    { left: '60%', delay: '-7s', duration: '11s', size: 'w-1.5 h-1.5', color: 'bg-orange-400 shadow-[0_0_8px_#fb923c]' },
    { left: '68%', delay: '-1.5s', duration: '10s', size: 'w-2.5 h-2.5', color: 'bg-red-500 shadow-[0_0_12px_#ef4444]' },
    { left: '76%', delay: '-5.5s', duration: '12.5s', size: 'w-1.5 h-1.5', color: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' },
    { left: '84%', delay: '-10s', duration: '9s', size: 'w-2 h-2', color: 'bg-orange-500 shadow-[0_0_10px_#f97316]' },
    { left: '92%', delay: '-3.5s', duration: '11.5s', size: 'w-1.5 h-1.5', color: 'bg-red-400 shadow-[0_0_8px_#f87171]' },
    { left: '15%', delay: '-4.5s', duration: '8.5s', size: 'w-1.5 h-1.5', color: 'bg-amber-300 shadow-[0_0_9px_#fcd34d]' },
    { left: '48%', delay: '-6.5s', duration: '10.5s', size: 'w-2 h-2', color: 'bg-red-500 shadow-[0_0_10px_#ef4444]' },
    { left: '72%', delay: '-8.5s', duration: '9.5s', size: 'w-1.5 h-1.5', color: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]' },
    { left: '88%', delay: '-2.5s', duration: '13s', size: 'w-2 h-2', color: 'bg-red-400 shadow-[0_0_10px_#f87171]' },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Dire (Crimson) & Radiant (Gold) ambient breathing aura */}
      <div className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-red-600/15 blur-[130px] animate-pulse-glow" />
      <div className="absolute top-1/3 -right-32 w-[500px] h-[500px] rounded-full bg-amber-500/12 blur-[130px] animate-pulse-glow" />

      {/* Rising Ember Sparks (pre-seeded mid-screen with negative delays) */}
      {embers.map((ember, idx) => (
        <span
          key={idx}
          className={`absolute bottom-0 rounded-full animate-ember ${ember.size} ${ember.color}`}
          style={{
            left: ember.left,
            animationDelay: ember.delay,
            animationDuration: ember.duration,
          }}
        />
      ))}
    </div>
  );
}
