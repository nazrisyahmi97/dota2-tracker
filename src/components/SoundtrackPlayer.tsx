'use client';

import { useState, useEffect, useRef } from 'react';
import { Music, Volume2 } from 'lucide-react';

const YOUTUBE_VIDEO_ID = '6p_a1SYs6Gs';

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (volume: number) => void;
  destroy: () => void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: {
          height?: string | number;
          width?: string | number;
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (event: { target: YTPlayer }) => void;
            onStateChange?: (event: { data: number }) => void;
          };
        }
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

export default function SoundtrackPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef<YTPlayer | null>(null);

  useEffect(() => {
    const initPlayer = () => {
      if (!window.YT || !window.YT.Player || playerRef.current) return;

      playerRef.current = new window.YT.Player('yt-dota-soundtrack', {
        height: '1',
        width: '1',
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          loop: 1,
          playlist: YOUTUBE_VIDEO_ID,
          modestbranding: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(45);
            setIsReady(true);
          },
          onStateChange: (event) => {
            // 1 = playing, 2 = paused, 0 = ended
            if (event.data === 1) setIsPlaying(true);
            if (event.data === 2 || event.data === 0) setIsPlaying(false);
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
      if (!document.getElementById('yt-iframe-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
    };
  }, []);

  const togglePlay = () => {
    if (!playerRef.current || !isReady) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.setVolume(45);
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  };

  return (
    <>
      {/* Hidden 1x1 YouTube Player Container */}
      <div className="fixed bottom-0 right-0 w-px h-px opacity-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div id="yt-dota-soundtrack" />
      </div>

      <button
        onClick={togglePlay}
        disabled={!isReady}
        title={isPlaying ? 'Pause Dota 2 Soundtrack' : 'Play Dota 2 Main Theme Soundtrack'}
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition duration-200 cursor-pointer disabled:opacity-60 ${
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
            <span>{isReady ? 'Play Theme' : 'Loading Theme...'}</span>
          </>
        )}
      </button>
    </>
  );
}
