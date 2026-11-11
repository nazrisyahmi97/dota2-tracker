'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function SoundtrackPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasCustomAudio, setHasCustomAudio] = useState<boolean | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ stop: () => void } | null>(null);

  // Check once if user placed a custom /audio/dota-theme.mp3 in public/audio/
  useEffect(() => {
    fetch('/audio/dota-theme.mp3', { method: 'HEAD' })
      .then((res) => setHasCustomAudio(res.ok))
      .catch(() => setHasCustomAudio(false));
  }, []);

  const stopSynth = useCallback(() => {
    if (nodesRef.current) {
      nodesRef.current.stop();
      nodesRef.current = null;
    }
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
  }, []);

  // Epic dark-fantasy ambient synth fallback (D minor atmospheric MOBA pad)
  const startSynth = useCallback(() => {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 2.0);
    masterGain.connect(ctx.destination);

    // Lowpass filter for warm orchestral pad feel
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, ctx.currentTime);
    filter.connect(masterGain);

    // Subtle LFO modulating filter frequency
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
    lfoGain.gain.setValueAtTime(160, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    // Deep D minor chord frequencies (D2, A2, F3, A3, D4)
    const freqs = [73.42, 110.0, 174.61, 220.0, 293.66];
    const oscs: OscillatorNode[] = [];

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = i < 2 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      // Slight detune for lush chorus texture
      osc.detune.setValueAtTime((i % 2 === 0 ? 1 : -1) * 4, ctx.currentTime);
      oscGain.gain.setValueAtTime(i < 2 ? 0.28 : 0.14, ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(filter);
      osc.start();
      oscs.push(osc);
    });

    nodesRef.current = {
      stop: () => {
        oscs.forEach((o) => {
          try {
            o.stop();
          } catch {}
        });
        try {
          lfo.stop();
        } catch {}
      },
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
        audioRef.current.volume = 0.45;
        await audioRef.current.play();
        setIsPlaying(true);
        return;
      } catch {
        // Fallback to synth if audio fails
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
        title={isPlaying ? 'Mute Dota Theme' : 'Play Dota Atmospheric Theme'}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition duration-200 cursor-pointer ${
          isPlaying
            ? 'bg-red-950/60 border-red-600/60 text-red-200 shadow-md shadow-red-900/30'
            : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800 text-zinc-400 hover:text-zinc-200'
        }`}
      >
        {isPlaying ? (
          <>
            <Volume2 className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Theme On</span>
            <span className="flex items-end gap-0.5 h-3 ml-0.5">
              <span className="w-0.5 h-full bg-red-400 rounded-full animate-eq-1 origin-bottom" />
              <span className="w-0.5 h-full bg-amber-400 rounded-full animate-eq-2 origin-bottom" />
              <span className="w-0.5 h-full bg-red-400 rounded-full animate-eq-3 origin-bottom" />
            </span>
          </>
        ) : (
          <>
            <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden sm:inline">Play Theme</span>
          </>
        )}
      </button>
    </>
  );
}
