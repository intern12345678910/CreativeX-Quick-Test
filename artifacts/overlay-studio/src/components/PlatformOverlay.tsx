import { PlatformId } from '@/types';

import metaReelsSrc from '@assets/Meta_Reels_1784733422053.svg';
import metaStoriesSrc from '@assets/Meta_Stories_1784733422080.svg';
import snapSrc from '@assets/Snap_1784733422080.svg';
import tiktokSrc from '@assets/TikTok_1784733422081.svg';
import youtubeHorizontalSrc from '@assets/Youtube_Horizontal_1784733422081.svg';
import youtubeSquareSrc from '@assets/Youtube_Square_1784733422081.svg';
import youtubeVerticalSrc from '@assets/Youtube_Vertical_1784733422082.svg';

const PLATFORM_SVGS: Record<PlatformId, string> = {
  'meta-reels': metaReelsSrc,
  'meta-story': metaStoriesSrc,
  'snap': snapSrc,
  'tiktok': tiktokSrc,
  'youtube-169': youtubeHorizontalSrc,
  'youtube-11': youtubeSquareSrc,
  'youtube-916': youtubeVerticalSrc,
};

interface Props {
  width: number;
  height: number;
  platformId: PlatformId;
}

export default function PlatformOverlay({ width, height, platformId }: Props) {
  const src = PLATFORM_SVGS[platformId];
  if (!src) return null;

  return (
    <img
      src={src}
      alt=""
      className="absolute inset-0 pointer-events-none"
      style={{ width, height, objectFit: 'fill' }}
      draggable={false}
      data-testid="platform-overlay"
    />
  );
}
