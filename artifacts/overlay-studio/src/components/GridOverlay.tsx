import { useEffect, useState } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import grid1x1 from '@assets/2.5__-_1x1_1784733581539.png';
import grid4x5 from '@assets/2.5__-_4x5_1784733581552.png';
import grid9x16 from '@assets/2.5__-_9x16_1784733581552.png';
import grid16x9 from '@assets/2.5__-_16x9_1784733581552.png';

interface GridDef {
  label: string;
  ratio: number;
  src: string;
  cols: number;
  rows: number;
}

// Every format is interacted with as 40 sections: 5 columns × 8 rows.
const GRIDS: GridDef[] = [
  { label: '1×1', ratio: 1 / 1, src: grid1x1, cols: 5, rows: 8 },
  { label: '4×5', ratio: 4 / 5, src: grid4x5, cols: 5, rows: 8 },
  { label: '9×16', ratio: 9 / 16, src: grid9x16, cols: 5, rows: 8 },
  { label: '16×9', ratio: 16 / 9, src: grid16x9, cols: 5, rows: 8 },
];

export function closestGrid(naturalWidth: number, naturalHeight: number): GridDef {
  const ar = naturalWidth / naturalHeight;
  return GRIDS.reduce((best, grid) =>
    Math.abs(grid.ratio - ar) < Math.abs(best.ratio - ar) ? grid : best,
  );
}

interface Props {
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
  mediaSrc: string;
  mediaType: 'image' | 'video';
}

export default function GridOverlay({
  width,
  height,
  naturalWidth,
  naturalHeight,
  mediaSrc,
  mediaType,
}: Props) {
  const grid = closestGrid(naturalWidth, naturalHeight);
  const selectedGridCells = useEditorStore((state) => state.selectedGridCells);
  const toggleGridCell = useEditorStore((state) => state.toggleGridCell);
  const [isLightBackground, setIsLightBackground] = useState(false);

  const cellW = width / grid.cols;
  const cellH = height / grid.rows;
  const isLandscape = naturalWidth / naturalHeight > 1.35;

  useEffect(() => {
    if (mediaType !== 'image') {
      setIsLightBackground(false);
      return;
    }

    const image = new Image();
    image.onload = () => {
      const sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = 20;
      sampleCanvas.height = 20;
      const context = sampleCanvas.getContext('2d');
      if (!context) return;

      context.drawImage(image, 0, 0, 20, 20);
      const pixels = context.getImageData(0, 0, 20, 20).data;
      let totalBrightness = 0;
      let visiblePixels = 0;

      for (let index = 0; index < pixels.length; index += 4) {
        if (pixels[index + 3] < 20) continue;
        totalBrightness += (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3;
        visiblePixels += 1;
      }

      setIsLightBackground(
        visiblePixels > 0 && totalBrightness / visiblePixels >= 190,
      );
    };
    image.src = mediaSrc;
  }, [mediaSrc, mediaType]);

  return (
    <div className="absolute inset-0 pointer-events-none" data-testid="grid-overlay">
      {!isLandscape && (
        <img
          src={grid.src}
          alt={`${grid.label} grid`}
          className="absolute inset-0 h-full w-full pointer-events-none"
          style={{
            objectFit: 'fill',
            filter: isLightBackground ? 'none' : 'invert(1)',
          }}
          draggable={false}
        />
      )}

      {isLandscape && (
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {Array.from({ length: grid.cols - 1 }, (_, index) => (
            <line
              key={`vertical-${index}`}
              x1={(width / grid.cols) * (index + 1)}
              y1="0"
              x2={(width / grid.cols) * (index + 1)}
              y2={height}
              stroke={isLightBackground ? '#111827' : '#ffffff'}
              strokeWidth="2"
              opacity="0.8"
            />
          ))}
          {Array.from({ length: grid.rows - 1 }, (_, index) => (
            <line
              key={`horizontal-${index}`}
              x1="0"
              y1={(height / grid.rows) * (index + 1)}
              x2={width}
              y2={(height / grid.rows) * (index + 1)}
              stroke={isLightBackground ? '#111827' : '#ffffff'}
              strokeWidth="2"
              opacity="0.8"
            />
          ))}
        </svg>
      )}

      <div className="absolute inset-0 pointer-events-auto">
        {Array.from({ length: grid.rows }, (_, row) =>
          Array.from({ length: grid.cols }, (_, col) => {
            const key = `${col}-${row}`;
            const selected = selectedGridCells.has(key);

            return (
              <div
                key={key}
                data-testid={`grid-cell-${col}-${row}`}
                onClick={() => toggleGridCell(key)}
                className="absolute cursor-pointer transition-colors duration-100"
                style={{
                  left: col * cellW,
                  top: row * cellH,
                  width: cellW,
                  height: cellH,
                  background: selected ? 'rgba(220, 38, 38, 0.45)' : 'transparent',
                }}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}