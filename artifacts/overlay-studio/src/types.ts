export type OverlayMode = 'none' | 'grid' | 'platform';

export type PlatformId =
  | 'meta-reels'
  | 'meta-story'
  | 'snap'
  | 'tiktok'
  | 'youtube-916'
  | 'youtube-11'
  | 'youtube-169';

export interface BaseMedia {
  type: 'image' | 'video';
  src: string;
  naturalWidth: number;
  naturalHeight: number;
}

export interface GridSettings {
  columns: number;
  rows: number;
  color: string;
  lineWidth: number;
  opacity: number;
}

export interface PlatformDef {
  id: PlatformId;
  label: string;
  shortLabel: string;
  aspectW: number;
  aspectH: number;
  accentColor: string;
  textColor: string;
}

export const PLATFORMS: PlatformDef[] = [
  {
    id: 'meta-reels',
    label: 'Meta Reels',
    shortLabel: 'Reels',
    aspectW: 9,
    aspectH: 16,
    accentColor: '#1877F2',
    textColor: '#fff',
  },
  {
    id: 'meta-story',
    label: 'Meta Story',
    shortLabel: 'Story',
    aspectW: 9,
    aspectH: 16,
    accentColor: '#E1306C',
    textColor: '#fff',
  },
  {
    id: 'snap',
    label: 'Snap',
    shortLabel: 'Snap',
    aspectW: 9,
    aspectH: 16,
    accentColor: '#FFFC00',
    textColor: '#000',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    shortLabel: 'TikTok',
    aspectW: 9,
    aspectH: 16,
    accentColor: '#FF0050',
    textColor: '#fff',
  },
  {
    id: 'youtube-916',
    label: 'YouTube 9×16',
    shortLabel: 'YT 9×16',
    aspectW: 9,
    aspectH: 16,
    accentColor: '#FF0000',
    textColor: '#fff',
  },
  {
    id: 'youtube-11',
    label: 'YouTube 1×1',
    shortLabel: 'YT 1×1',
    aspectW: 1,
    aspectH: 1,
    accentColor: '#FF0000',
    textColor: '#fff',
  },
  {
    id: 'youtube-169',
    label: 'YouTube 16×9',
    shortLabel: 'YT 16×9',
    aspectW: 16,
    aspectH: 9,
    accentColor: '#FF0000',
    textColor: '#fff',
  },
];
