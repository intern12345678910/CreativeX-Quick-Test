import { useRef, useEffect, useState, useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import GridOverlay from './GridOverlay';
import PlatformOverlay from './PlatformOverlay';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

const FPS = 24;

function formatTimecode(seconds: number): string {
  const totalFrames = Math.floor(seconds * FPS);
  const frames = totalFrames % FPS;
  const totalSecs = Math.floor(seconds);
  const secs = totalSecs % 60;
  const mins = Math.floor(totalSecs / 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
}

export default function Canvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isScrubbingRef = useRef(false);
  const wasPlayingRef = useRef(false);

  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const baseMedia = useEditorStore((s) => s.baseMedia);
  const overlayMode = useEditorStore((s) => s.overlayMode);
  const selectedPlatform = useEditorStore((s) => s.selectedPlatform);

  const updateSize = useCallback(() => {
    if (!containerRef.current || !baseMedia) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const ar = baseMedia.naturalWidth / baseMedia.naturalHeight;
    
    // If it's a video, reserve ~64px of vertical space for the control bar
    const isVideo = baseMedia.type === 'video';
    const availableHeight = isVideo ? clientHeight - 64 : clientHeight;

    
    const cAR = clientWidth / availableHeight;
    let w: number, h: number;
    if (ar > cAR) {
      w = clientWidth;
      h = clientWidth / ar;
    } else {
      h = availableHeight;
      w = availableHeight * ar;
    }
    setDisplaySize({ width: Math.floor(w), height: Math.floor(h) });
  }, [baseMedia]);

  useEffect(() => {
    updateSize();
    const ro = new ResizeObserver(updateSize);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [updateSize]);

  useEffect(() => {
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);
  }, [baseMedia]);

  // CRITICAL FIX 1: Track when the canvas actually mounts so the effect knows to run
  const isCanvasReady = displaySize.width > 0;

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const onTimeUpdate = () => { 
      if (!isScrubbingRef.current) setCurrentTime(vid.currentTime); 
    };
    const onDurationChange = () => setDuration(vid.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    if (vid.readyState >= 1) {
      setDuration(vid.duration);
    }

    vid.addEventListener('timeupdate', onTimeUpdate);
    vid.addEventListener('durationchange', onDurationChange);
    vid.addEventListener('loadedmetadata', onDurationChange);
    vid.addEventListener('play', onPlay);
    vid.addEventListener('pause', onPause);

    return () => {
      vid.removeEventListener('timeupdate', onTimeUpdate);
      vid.removeEventListener('durationchange', onDurationChange);
      vid.removeEventListener('loadedmetadata', onDurationChange);
      vid.removeEventListener('play', onPlay);
      vid.removeEventListener('pause', onPause);
    };
  }, [baseMedia, isCanvasReady]); // Now runs when displaySize.width > 0

  const togglePlayback = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.paused ? vid.play() : vid.pause();
  };

  const stepFrame = (direction: 1 | -1) => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.pause();
    const next = Math.max(0, Math.min(duration, vid.currentTime + direction / FPS));
    vid.currentTime = next;
    setCurrentTime(next);
  };

  const onScrubStart = () => {
    const vid = videoRef.current;
    if (!vid) return;

    wasPlayingRef.current = !vid.paused;
    isScrubbingRef.current = true;
    setIsScrubbing(true);

    vid.pause();
  };

  const onScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const frameNumber = Number(e.target.value);
    const targetTime = frameNumber / FPS;

    setCurrentTime(targetTime);
    if (videoRef.current) {
      videoRef.current.currentTime = targetTime;
    }
  };

  const onScrubEnd = () => {
    isScrubbingRef.current = false;
    setIsScrubbing(false);

    if (wasPlayingRef.current) {
      videoRef.current?.play();
    }
  };

  if (!baseMedia) return null;

  const isVideo = baseMedia.type === 'video';

  const currentFrame = Math.floor(currentTime * FPS);
  const totalFrames = Math.floor(duration * FPS);

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a]"
      data-testid="canvas-container"
    >
      {displaySize.width > 0 && (
        <>
          <div
            id="export-canvas"
            data-testid="canvas-area"
            className="relative flex-shrink-0"
            style={{ width: displaySize.width, height: displaySize.height }}
          >
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
                ref={videoRef}
                src={baseMedia.src}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full"
                data-testid="base-video"
              />
            )}

            {overlayMode === 'grid' && (
              <GridOverlay
                width={displaySize.width}
                height={displaySize.height}
                naturalWidth={baseMedia.naturalWidth}
                naturalHeight={baseMedia.naturalHeight}
              />
            )}

            {overlayMode === 'platform' && selectedPlatform && (
              <PlatformOverlay
                width={displaySize.width}
                height={displaySize.height}
                platformId={selectedPlatform}
              />
            )}
          </div>

          {isVideo && (
            <div
              data-testid="video-controls"
              className="flex-shrink-0 flex flex-col gap-2 px-3 pt-2.5 pb-2"
              style={{ width: displaySize.width }}
            >
              {/* CRITICAL FIX 2: onPointerDown/Up tracks dragging even outside the slider bounds */}
              <input
                type="range"
                min={0}
                max={totalFrames || 0}
                step={1}
                value={currentFrame}
                onPointerDown={onScrubStart}
                onChange={onScrubChange}
                onPointerUp={onScrubEnd}
                data-testid="scrubber"
                className="w-full h-1 rounded-full appearance-none bg-white/15 accent-white cursor-pointer"
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={() => stepFrame(-1)}
                  data-testid="button-prev-frame"
                  title="Previous frame"
                  className="flex items-center justify-center w-7 h-7 rounded text-white/50 hover:text-white hover:bg-white/8 transition-colors"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={togglePlayback}
                  data-testid="button-play-pause"
                  title={isPlaying ? 'Pause' : 'Play'}
                  className="flex items-center justify-center w-7 h-7 rounded text-white hover:bg-white/8 transition-colors"
                >
                  {isPlaying
                    ? <Pause className="w-4 h-4" />
                    : <Play className="w-4 h-4 translate-x-px" />}
                </button>

                <button
                  onClick={() => stepFrame(1)}
                  data-testid="button-next-frame"
                  title="Next frame"
                  className="flex items-center justify-center w-7 h-7 rounded text-white/50 hover:text-white hover:bg-white/8 transition-colors"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

                <span
                  data-testid="timecode"
                  className="ml-1 font-mono text-xs text-white/70 tracking-wider select-none"
                >
                  {formatTimecode(currentTime)}
                </span>

                <span className="font-mono text-xs text-white/25 select-none">/</span>

                <span className="font-mono text-xs text-white/35 select-none">
                  {formatTimecode(duration)}
                </span>

                <span className="ml-auto text-[10px] text-white/20 font-mono select-none">
                  {FPS} fps
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}