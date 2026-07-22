import { useRef, useEffect, useState, useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import GridOverlay from './GridOverlay';
import PlatformOverlay from './PlatformOverlay';
import { PLATFORMS } from '@/types';

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });

  const baseMedia = useEditorStore((s) => s.baseMedia);
  const overlayMode = useEditorStore((s) => s.overlayMode);
  const gridSettings = useEditorStore((s) => s.gridSettings);
  const selectedPlatform = useEditorStore((s) => s.selectedPlatform);

  const activePlatform = PLATFORMS.find((p) => p.id === selectedPlatform) ?? null;

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
            <video
              src={baseMedia.src}
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full"
              data-testid="base-video"
            />
          )}

          {/* Grid overlay */}
          {overlayMode === 'grid' && (
            <GridOverlay
              width={displaySize.width}
              height={displaySize.height}
              settings={gridSettings}
            />
          )}

          {/* Platform overlay */}
          {overlayMode === 'platform' && activePlatform && (
            <PlatformOverlay
              width={displaySize.width}
              height={displaySize.height}
              platform={activePlatform}
            />
          )}
        </div>
      )}
    </div>
  );
}
