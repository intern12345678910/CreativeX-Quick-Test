import { useRef, useEffect, useState, useCallback } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import GridOverlay from './GridOverlay';
import PlatformOverlay from './PlatformOverlay';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';

const FPS = 30;

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

  useEffect(() => {
    setIsPlaying(true);
    setCurrentTime(0);
    setDuration(0);
  }, [baseMedia]);

  // Wire up video events
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const onTimeUpdate = () => { if (!isScrubbing) setCurrentTime(vid.currentTime); };
    const onDurationChange = () => setDuration(vid.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

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
  }, [isScrubbing, baseMedia]);

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
    setIsScrubbing(true);
    videoRef.current?.pause();
  };

  const onScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = Number(e.target.value);
    setCurrentTime(t);
    if (videoRef.current) videoRef.current.currentTime = t;
  };

  const onScrubEnd = () => {
    setIsScrubbing(false);
    if (isPlaying) videoRef.current?.play();
  };

  if (!baseMedia) return null;

  const isVideo = baseMedia.type === 'video';

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a]"
      data-testid="canvas-container"
    >
      {displaySize.width > 0 && (
        <>
          {/* Canvas area */}
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

          {/* Video controls bar — outside export area */}
          {isVideo && (
            <div
              data-testid="video-controls"
              className="flex-shrink-0 flex flex-col gap-2 px-3 pt-2.5 pb-2"
              style={{ width: displaySize.width }}
            >
              {/* Scrubber */}
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={1 / FPS}
                value={currentTime}
                onMouseDown={onScrubStart}
                onTouchStart={onScrubStart}
                onChange={onScrubChange}
                onMouseUp={onScrubEnd}
                onTouchEnd={onScrubEnd}
                data-testid="scrubber"
                className="w-full h-1 rounded-full appearance-none bg-white/15 accent-white cursor-pointer"
              />

              {/* Buttons + timecode row */}
              <div className="flex items-center gap-2">
                {/* Prev frame */}
                <button
                  onClick={() => stepFrame(-1)}
                  data-testid="button-prev-frame"
                  title="Previous frame"
                  className="flex items-center justify-center w-7 h-7 rounded text-white/50 hover:text-white hover:bg-white/8 transition-colors"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>

                {/* Play / Pause */}
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

                {/* Next frame */}
                <button
                  onClick={() => stepFrame(1)}
                  data-testid="button-next-frame"
                  title="Next frame"
                  className="flex items-center justify-center w-7 h-7 rounded text-white/50 hover:text-white hover:bg-white/8 transition-colors"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>

                {/* Timecode */}
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

                {/* FPS badge */}
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
