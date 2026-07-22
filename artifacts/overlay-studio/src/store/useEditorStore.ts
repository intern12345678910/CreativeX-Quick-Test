import { create } from 'zustand';
import { BaseMedia, GridSettings, OverlayMode, PlatformId } from '../types';

function defaultGrid(naturalWidth: number, naturalHeight: number): GridSettings {
  const ar = naturalWidth / naturalHeight;
  const rows = 3;
  const columns = Math.max(2, Math.round(ar * rows));
  return { columns, rows, color: '#ffffff', lineWidth: 1, opacity: 0.5 };
}

interface EditorState {
  baseMedia: BaseMedia | null;
  overlayMode: OverlayMode;
  gridSettings: GridSettings;
  selectedPlatform: PlatformId | null;

  setBaseMedia: (media: BaseMedia | null) => void;
  setOverlayMode: (mode: OverlayMode) => void;
  setGridSettings: (s: Partial<GridSettings>) => void;
  setSelectedPlatform: (id: PlatformId | null) => void;
  clearAll: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  baseMedia: null,
  overlayMode: 'none',
  gridSettings: { columns: 3, rows: 3, color: '#ffffff', lineWidth: 1, opacity: 0.5 },
  selectedPlatform: null,

  setBaseMedia: (media) =>
    set({
      baseMedia: media,
      overlayMode: 'none',
      selectedPlatform: null,
      gridSettings: media
        ? defaultGrid(media.naturalWidth, media.naturalHeight)
        : { columns: 3, rows: 3, color: '#ffffff', lineWidth: 1, opacity: 0.5 },
    }),

  setOverlayMode: (mode) => set({ overlayMode: mode }),

  setGridSettings: (s) =>
    set((state) => ({ gridSettings: { ...state.gridSettings, ...s } })),

  setSelectedPlatform: (id) => set({ selectedPlatform: id }),

  clearAll: () =>
    set({
      baseMedia: null,
      overlayMode: 'none',
      selectedPlatform: null,
      gridSettings: { columns: 3, rows: 3, color: '#ffffff', lineWidth: 1, opacity: 0.5 },
    }),
}));
