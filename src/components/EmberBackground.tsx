export default function EmberBackground() {
  const embers = [
    { left: '8%', delay: '0s', duration: '11s', size: 'w-1.5 h-1.5', color: 'bg-red-500/60' },
    { left: '18%', delay: '2.5s', duration: '14s', size: 'w-1 h-1', color: 'bg-amber-400/70' },
    { left: '29%', delay: '4s', duration: '12s', size: 'w-2 h-2', color: 'bg-orange-500/40' },
    { left: '42%', delay: '1s', duration: '15s', size: 'w-1 h-1', color: 'bg-red-400/60' },
    { left: '56%', delay: '5.5s', duration: '13s', size: 'w-1.5 h-1.5', color: 'bg-amber-300/50' },
    { left: '68%', delay: '3s', duration: '10s', size: 'w-1 h-1', color: 'bg-red-500/70' },
    { left: '79%', delay: '6s', duration: '14s', size: 'w-2 h-2', color: 'bg-amber-500/40' },
    { left: '91%', delay: '1.5s', duration: '12s', size: 'w-1 h-1', color: 'bg-orange-400/60' },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Subtle Dire & Radiant ambient glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-red-700/10 blur-[120px] animate-pulse-glow" />
      <div className="absolute top-1/3 -right-40 w-[450px] h-[450px] rounded-full bg-amber-600/10 blur-[120px] animate-pulse-glow" />

      {/* Rising Ember Sparks */}
      {embers.map((ember, idx) => (
        <span
          key={idx}
          className={`absolute -bottom-4 rounded-full blur-[0.5px] animate-ember ${ember.size} ${ember.color}`}
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
