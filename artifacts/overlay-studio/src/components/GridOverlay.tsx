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

// All grids divide the image into exactly 40 sections.
// Portrait/square: 5 cols × 8 rows. Landscape: 8 cols × 5 rows.
// Confirmed by pixel-level analysis of grid line positions in each PNG.
const GRIDS: GridDef[] = [
  { label: '1×1',  ratio: 1 / 1,   src: grid1x1,  cols: 5, rows: 8 },
  { label: '4×5',  ratio: 4 / 5,   src: grid4x5,  cols: 5, rows: 8 },
  { label: '9×16', ratio: 9 / 16,  src: grid9x16, cols: 5, rows: 8 },
  { label: '16×9', ratio: 16 / 9,  src: grid16x9, cols: 8, rows: 5 },
];

export function closestGrid(naturalWidth: number, naturalHeight: number): GridDef {
  const ar = naturalWidth / naturalHeight;
  return GRIDS.reduce((best, g) =>
    Math.abs(g.ratio - ar) < Math.abs(best.ratio - ar) ? g : best
  );
}

interface Props {
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
}

export default function GridOverlay({ width, height, naturalWidth, naturalHeight }: Props) {
  const grid = closestGrid(naturalWidth, naturalHeight);
  const selectedGridCells = useEditorStore((s) => s.selectedGridCells);
  const toggleGridCell = useEditorStore((s) => s.toggleGridCell);

  const cellW = width / grid.cols;
  const cellH = height / grid.rows;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      data-testid="grid-overlay"
    >
      {/* PNG grid lines — invert turns black lines to white on transparent bg */}
      <img
        src={grid.src}
        alt={`${grid.label} grid`}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ objectFit: 'fill', filter: 'invert(1)' }}
        draggable={false}
      />

      {/* Interactive cell layer */}
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
          })
        )}
      </div>
    </div>
  );
}
