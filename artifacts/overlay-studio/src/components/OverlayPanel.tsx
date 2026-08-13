import { useEditorStore } from '@/store/useEditorStore';
import { PLATFORMS, PlatformId } from '@/types';
import { Check, ChevronRight, Download, Grid3X3, LayoutGrid, RotateCcw } from 'lucide-react';
import { toPng } from 'html-to-image';
import type { ReactNode } from 'react';

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
    setOverlayMode(overlayMode === mode ? 'none' : mode);
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
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  return (
    <aside
      className="flex max-h-[48dvh] w-full flex-shrink-0 flex-col border-t border-white/[.08] bg-[#1b2a2d] md:max-h-none md:w-[310px] md:border-l md:border-t-0"
      data-testid="overlay-panel"
    >
      <div className="flex items-center justify-between border-b border-white/[.08] px-5 py-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8e9d99]">Guide controls</p>
          <p className="mt-1 text-sm font-medium text-[#eee9dd]">Overlay configuration</p>
        </div>
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8e9d99] transition-colors hover:bg-white/[.07] hover:text-[#eee9dd]"
          title="Start a new composition"
          data-testid="button-new"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">New</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8e9d99]">01 / Select guide</p>
          <span className="font-mono text-[10px] text-[#647571]">2 modes</span>
        </div>
        <div className="space-y-2.5">
          <ModeButton
            active={overlayMode === 'grid'}
            icon={<Grid3X3 className="h-4 w-4" />}
            label="Clear Presence Grid"
            desc="Mark cells where the composition can breathe"
            onClick={() => handleModeToggle('grid')}
            testId="button-mode-grid"
          />
          <ModeButton
            active={overlayMode === 'platform'}
            icon={<LayoutGrid className="h-4 w-4" />}
            label="Safe Zone Overlay"
            desc="Preview platform UI and caption boundaries"
            onClick={() => handleModeToggle('platform')}
            testId="button-mode-platform"
          />
        </div>

        {overlayMode === 'grid' && baseMedia && (
          <div className="mt-6 space-y-3" data-testid="grid-controls">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8e9d99]">02 / Mark cells</p>
            <div className="rounded-lg border border-white/[.08] bg-[#223336] p-3.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#d9ded3]">Auto-fit grid</p>
                <span className="rounded bg-[#314448] px-1.5 py-1 font-mono text-[9px] text-[#9daaa3]">
                  {baseMedia.naturalWidth > baseMedia.naturalHeight ? '16:9' : baseMedia.naturalWidth === baseMedia.naturalHeight ? '1:1' : '9:16'}
                </span>
              </div>
              <p className="mt-2 font-mono text-[10px] text-[#71817d]">
                {baseMedia.naturalWidth} × {baseMedia.naturalHeight}px
              </p>
              <p className="mt-3 border-t border-white/[.08] pt-3 text-[11px] leading-5 text-[#8e9d99]">
                Click any section on the canvas to tint it red. Use the marked cells as a quick clearance check.
              </p>
            </div>
            {selectedGridCells.size > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-[#d66050]/35 bg-[#633d3a]/35 px-3 py-2.5">
                <span className="text-xs font-medium text-[#efaa9e]">
                  {selectedGridCells.size} cell{selectedGridCells.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={clearGridCells}
                  className="rounded px-1.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#e18b7d] transition-colors hover:bg-[#d66050]/15 hover:text-[#ffd0c7]"
                  data-testid="button-clear-cells"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}

        {overlayMode === 'platform' && (
          <div className="mt-6 space-y-2.5" data-testid="platform-controls">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8e9d99]">02 / Choose platform</p>
              <span className="font-mono text-[10px] text-[#647571]">{selectedPlatform ? 'Active' : 'None'}</span>
            </div>
            {PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                onClick={() => handlePlatformSelect(platform.id)}
                data-testid={`button-platform-${platform.id}`}
                className={`group flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition-all ${
                  selectedPlatform === platform.id
                    ? 'border-white/[.18] bg-[#2a3d40]'
                    : 'border-white/[.06] bg-[#223336] hover:border-white/[.13] hover:bg-[#263b3e]'
                }`}
                style={selectedPlatform === platform.id ? { borderColor: `${platform.accentColor}88` } : undefined}
              >
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: platform.accentColor }} />
                <span className="flex-1 text-xs font-medium text-[#d9ded3]">{platform.label}</span>
                <span className="font-mono text-[10px] text-[#71817d]">{platform.aspectW}:{platform.aspectH}</span>
                {selectedPlatform === platform.id ? (
                  <Check className="h-3.5 w-3.5" style={{ color: platform.accentColor }} />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-[#526764] transition-transform group-hover:translate-x-0.5" />
                )}
              </button>
            ))}
          </div>
        )}

        {overlayMode === 'none' && (
          <div className="mt-6 rounded-lg border border-dashed border-white/[.1] px-4 py-5 text-center">
            <p className="text-xs font-medium text-[#a9b2aa]">No guide on canvas</p>
            <p className="mt-1.5 text-[11px] leading-5 text-[#71817d]">Choose a mode above to start checking your composition.</p>
          </div>
        )}
      </div>

      <div className="border-t border-white/[.08] p-5">
        <button
          onClick={handleExport}
          disabled={!baseMedia}
          data-testid="button-export"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#d66050] py-3 text-sm font-bold text-[#fff6ed] shadow-[0_7px_18px_rgba(214,96,80,.18)] transition-all hover:bg-[#e27664] hover:shadow-[0_9px_24px_rgba(214,96,80,.26)] disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
        >
          <Download className="h-4 w-4" />
          Export PNG
        </button>
        <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-[#647571]">2× resolution · transparent overlays</p>
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
  icon: ReactNode;
  label: string;
  desc: string;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      onClick={onClick}
      data-testid={testId}
      className={`flex w-full items-start gap-3 rounded-lg border px-3.5 py-3.5 text-left transition-all ${
        active
          ? 'border-[#d66050]/55 bg-[#633d3a]/45 text-[#f7e8dc]'
          : 'border-white/[.06] bg-[#223336] text-[#a9b2aa] hover:border-white/[.13] hover:bg-[#263b3e]'
      }`}
    >
      <span className={`mt-0.5 ${active ? 'text-[#e58e7f]' : 'text-[#70827e]'}`}>{icon}</span>
      <div>
        <p className={`mb-1 text-[13px] font-semibold leading-tight ${active ? 'text-[#f9eee4]' : 'text-[#c3ccc2]'}`}>{label}</p>
        <p className="text-[11px] leading-4 text-[#7d8d89]">{desc}</p>
      </div>
    </button>
  );
}