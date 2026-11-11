'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Music, Volume2 } from 'lucide-react';

export default function SoundtrackPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasCustomAudio, setHasCustomAudio] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    fetch('/audio/dota-theme.mp3', { method: 'HEAD' })
      .then((res) => setHasCustomAudio(res.ok))
      .catch(() => setHasCustomAudio(false));
  }, []);

  const stopSynth = useCallback(() => {
    if (stopRef.current) {
      stopRef.current();
      stopRef.current = null;
    }
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
  }, []);

  // Epic cinematic dark-fantasy synth (D minor war-horn brass pad + rhythmic bass pulse)
  const startSynth = useCallback(() => {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.01, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.38, ctx.currentTime + 1.2);
    masterGain.connect(ctx.destination);

    // Warm sweeping lowpass filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(850, ctx.currentTime);
    filter.Q.setValueAtTime(2.5, ctx.currentTime);
    filter.connect(masterGain);

    // Filter sweep LFO for dramatic rising/falling tension
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.18, ctx.currentTime);
    lfoGain.gain.setValueAtTime(420, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    // Rich epic D minor chord (D2, A2, D3, F3, A3, D4)
    const freqs = [73.42, 110.0, 146.83, 174.61, 220.0, 293.66];
    const oscs: OscillatorNode[] = [];

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = i < 3 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.detune.setValueAtTime((i % 2 === 0 ? 1 : -1) * 6, ctx.currentTime);
      oscGain.gain.setValueAtTime(i < 2 ? 0.25 : 0.14, ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();
      oscs.push(osc);
    });

    // Subtle deep war-drum pulse every 2.4 seconds
    const drumInterval = window.setInterval(() => {
      if (ctx.state !== 'running') return;
      const now = ctx.currentTime;
      const drumOsc = ctx.createOscillator();
      const drumGain = ctx.createGain();
      drumOsc.type = 'sine';
      drumOsc.frequency.setValueAtTime(95, now);
      drumOsc.frequency.exponentialRampToValueAtTime(36, now + 0.45);
      drumGain.gain.setValueAtTime(0.45, now);
      drumGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      drumOsc.connect(drumGain);
      drumGain.connect(masterGain);
      drumOsc.start(now);
      drumOsc.stop(now + 0.65);
    }, 2400);

    stopRef.current = () => {
      window.clearInterval(drumInterval);
      oscs.forEach((o) => {
        try {
          o.stop();
        } catch {}
      });
      try {
        lfo.stop();
      } catch {}
    };
  }, []);

  const togglePlay = async () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      stopSynth();
      setIsPlaying(false);
      return;
    }

    if (hasCustomAudio && audioRef.current) {
      try {
        audioRef.current.volume = 0.55;
        await audioRef.current.play();
        setIsPlaying(true);
        return;
      } catch {
        // Fallback to synth
      }
    }

    startSynth();
    setIsPlaying(true);
  };

  useEffect(() => {
    return () => {
      stopSynth();
    };
  }, [stopSynth]);

  return (
    <>
      {hasCustomAudio && (
        <audio ref={audioRef} src="/audio/dota-theme.mp3" loop preload="none" />
      )}
      <button
        onClick={togglePlay}
        title={isPlaying ? 'Mute Soundtrack' : 'Play Dota Theme Soundtrack'}
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition duration-200 cursor-pointer ${
          isPlaying
            ? 'bg-gradient-to-r from-red-900/80 to-amber-900/70 border-amber-500/70 text-amber-200 shadow-lg shadow-red-900/40'
            : 'bg-red-950/50 hover:bg-red-900/60 border-red-700/60 text-red-200 hover:text-white shadow-sm shadow-red-950/30 animate-pulse'
        }`}
      >
        {isPlaying ? (
          <>
            <Volume2 className="w-3.5 h-3.5 text-amber-300" />
            <span>Theme On</span>
            <span className="flex items-end gap-0.5 h-3 ml-0.5">
              <span className="w-0.5 h-full bg-amber-400 rounded-full animate-eq-1 origin-bottom" />
              <span className="w-0.5 h-full bg-red-400 rounded-full animate-eq-2 origin-bottom" />
              <span className="w-0.5 h-full bg-amber-300 rounded-full animate-eq-3 origin-bottom" />
            </span>
          </>
        ) : (
          <>
            <Music className="w-3.5 h-3.5 text-amber-400" />
            <span>Play Theme</span>
          </>
        )}
      </button>
    </>
  );
}
