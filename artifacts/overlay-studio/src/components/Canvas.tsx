import { useRef, useEffect, useState, useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import GridOverlay from './GridOverlay';
import PlatformOverlay from './PlatformOverlay';
import { Play, Pause } from 'lucide-react';

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [isPlaying, setIsPlaying] = useState(true);

  const baseMedia = useEditorStore((s) => s.baseMedia);
  const overlayMode = useEditorStore((s) => s.overlayMode);
  const gridSettings = useEditorStore((s) => s.gridSettings);
  const selectedPlatform = useEditorStore((s) => s.selectedPlatform);

  const updateSize = useCallback(() => {
    if (!containerRef.current || !baseMedia) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const ar = baseMedia.naturalWidth / baseMedia.naturalHeight;
    const cAR = clientWidth / clientHeight;
    let w: number, h: number;
    if (ar > cAR) {
      w = clientWidth;
      h = clientWidth / ar;
    } else {
      h = clientHeight;
      w = clientHeight * ar;
    }
    setDisplaySize({ width: Math.floor(w), height: Math.floor(h) });
  }, [baseMedia]);

  useEffect(() => {
    updateSize();
    const ro = new ResizeObserver(updateSize);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [updateSize]);

  // Sync play/pause state whenever video element mounts or media changes
  useEffect(() => {
    setIsPlaying(true);
  }, [baseMedia]);

  const togglePlayback = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play();
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  if (!baseMedia) return null;

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-center justify-center overflow-hidden bg-[#0a0a0a]"
      data-testid="canvas-container"
    >
      {displaySize.width > 0 && (
        <div
          id="export-canvas"
          data-testid="canvas-area"
          className="relative flex-shrink-0"
          style={{ width: displaySize.width, height: displaySize.height }}
        >
          {/* Base media */}
          {baseMedia.type === 'image' ? (
            <img
              src={baseMedia.src}
              alt="Base"
              className="absolute inset-0 w-full h-full"
              draggable={false}
              data-testid="base-image"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                src={baseMedia.src}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full"
                data-testid="base-video"
              />

              {/* Play / Pause button */}
              <button
                onClick={togglePlayback}
                data-testid="button-play-pause"
                className="absolute bottom-3 left-3 z-20 flex items-center justify-center w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 translate-x-px" />
                )}
              </button>
            </>
          )}

          {/* Grid overlay */}
          {overlayMode === 'grid' && (
            <GridOverlay
              width={displaySize.width}
              height={displaySize.height}
              naturalWidth={baseMedia.naturalWidth}
              naturalHeight={baseMedia.naturalHeight}
            />
          )}

          {/* Platform overlay */}
          {overlayMode === 'platform' && selectedPlatform && (
            <PlatformOverlay
              width={displaySize.width}
              height={displaySize.height}
              platformId={selectedPlatform}
            />
          )}
        </div>
      )}
    </div>
  );
}
