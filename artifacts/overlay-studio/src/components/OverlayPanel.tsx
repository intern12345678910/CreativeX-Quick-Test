import { useEditorStore } from '@/store/useEditorStore';
import { PLATFORMS, PlatformId } from '@/types';
import { Grid, LayoutGrid, Download, RotateCcw } from 'lucide-react';
import { toPng } from 'html-to-image';

export default function OverlayPanel() {
  const overlayMode = useEditorStore((s) => s.overlayMode);
  const setOverlayMode = useEditorStore((s) => s.setOverlayMode);
  const selectedPlatform = useEditorStore((s) => s.selectedPlatform);
  const selectedGridCells = useEditorStore((s) => s.selectedGridCells);
  const clearGridCells = useEditorStore((s) => s.clearGridCells);
  const setSelectedPlatform = useEditorStore((s) => s.setSelectedPlatform);
  const baseMedia = useEditorStore((s) => s.baseMedia);
  const clearAll = useEditorStore((s) => s.clearAll);

  const handleModeToggle = (mode: 'grid' | 'platform') => {
    if (overlayMode === mode) {
      setOverlayMode('none');
    } else {
      setOverlayMode(mode);
    }
  };

  const handlePlatformSelect = (id: PlatformId) => {
    if (overlayMode !== 'platform') setOverlayMode('platform');
    setSelectedPlatform(selectedPlatform === id ? null : id);
  };

  const handleExport = async () => {
    const el = document.getElementById('export-canvas');
    if (!el) return;
    try {
      const dataUrl = await toPng(el, { pixelRatio: 2 });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'overlay-studio-export.png';
      a.click();
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  return (
    <aside
      className="w-64 flex-shrink-0 flex flex-col border-l border-white/8 bg-[#111113]"
      data-testid="overlay-panel"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest text-white/40 uppercase">
          Overlay
        </span>
        <button
          onClick={clearAll}
          className="p-1.5 rounded hover:bg-white/8 text-white/30 hover:text-white/60 transition-colors"
          title="New"
          data-testid="button-new"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Mode buttons */}
        <div className="space-y-2">
          <ModeButton
            active={overlayMode === 'grid'}
            icon={<Grid className="w-4 h-4" />}
            label="Grid"
            desc="Cell-based guide grid"
            onClick={() => handleModeToggle('grid')}
            testId="button-mode-grid"
          />
          <ModeButton
            active={overlayMode === 'platform'}
            icon={<LayoutGrid className="w-4 h-4" />}
            label="Platform Format"
            desc="Social media safe zone"
            onClick={() => handleModeToggle('platform')}
            testId="button-mode-platform"
          />
        </div>

        {/* Grid info */}
        {overlayMode === 'grid' && baseMedia && (
          <div className="space-y-2" data-testid="grid-controls">
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">
              Grid
            </p>
            <div className="px-3 py-2.5 rounded-md bg-white/4 space-y-1">
              <p className="text-xs text-white/60">
                Auto-selected from aspect ratio
              </p>
              <p className="text-[11px] text-white/30 font-mono">
                {baseMedia.naturalWidth} × {baseMedia.naturalHeight}px
              </p>
            </div>
            {selectedGridCells.size > 0 && (
              <div className="flex items-center justify-between px-3 py-2 rounded-md bg-red-950/40 ring-1 ring-red-800/40">
                <span className="text-xs text-red-300">
                  {selectedGridCells.size} cell{selectedGridCells.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={clearGridCells}
                  className="text-[10px] text-red-400 hover:text-red-200 font-medium transition-colors"
                  data-testid="button-clear-cells"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}

        {/* Platform controls */}
        {overlayMode === 'platform' && (
          <div className="space-y-2" data-testid="platform-controls">
            <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">
              Platform
            </p>
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePlatformSelect(p.id)}
                data-testid={`button-platform-${p.id}`}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left transition-all ${
                  selectedPlatform === p.id
                    ? 'bg-white/10 ring-1 ring-inset'
                    : 'bg-white/4 hover:bg-white/7'
                }`}
                style={
                  selectedPlatform === p.id
                    ? { ringColor: p.accentColor }
                    : undefined
                }
              >
                {/* Color dot */}
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: p.accentColor }}
                />
                <span className="flex-1 text-xs font-medium text-white/80">
                  {p.label}
                </span>
                <span className="text-[10px] text-white/30 font-mono">
                  {p.aspectW}:{p.aspectH}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Export */}
      <div className="p-4 border-t border-white/8">
        <button
          onClick={handleExport}
          disabled={!baseMedia}
          data-testid="button-export"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
        >
          <Download className="w-4 h-4" />
          Export PNG
        </button>
      </div>
    </aside>
  );
}

function ModeButton({
  active,
  icon,
  label,
  desc,
  onClick,
  testId,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  desc: string;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-all ${
        active
          ? 'bg-blue-600/20 ring-1 ring-blue-500/50 text-white'
          : 'bg-white/5 hover:bg-white/8 text-white/60'
      }`}
    >
      <span className={`mt-0.5 ${active ? 'text-blue-400' : 'text-white/30'}`}>{icon}</span>
      <div>
        <p className={`text-sm font-semibold leading-none mb-1 ${active ? 'text-white' : 'text-white/70'}`}>
          {label}
        </p>
        <p className="text-[11px] text-white/35">{desc}</p>
      </div>
    </button>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  onChange,
  testId,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  testId: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-white/50">{label}</span>
        {!label.includes('%') && (
          <span className="text-xs text-white/70 font-mono">{value}</span>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-blue-500 cursor-pointer"
        data-testid={testId}
      />
    </div>
  );
}
