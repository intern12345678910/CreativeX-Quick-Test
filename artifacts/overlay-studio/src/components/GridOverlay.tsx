import { GridSettings } from '@/types';

interface Props {
  width: number;
  height: number;
  settings: GridSettings;
}

export default function GridOverlay({ width, height, settings }: Props) {
  const { columns, rows, color, lineWidth, opacity } = settings;

  const verticals: number[] = [];
  for (let i = 1; i < columns; i++) {
    verticals.push((width / columns) * i);
  }

  const horizontals: number[] = [];
  for (let i = 1; i < rows; i++) {
    horizontals.push((height / rows) * i);
  }

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
      style={{ opacity }}
      data-testid="grid-overlay"
    >
      {/* Outer border */}
      <rect
        x={lineWidth / 2}
        y={lineWidth / 2}
        width={width - lineWidth}
        height={height - lineWidth}
        fill="none"
        stroke={color}
        strokeWidth={lineWidth}
      />

      {/* Vertical lines */}
      {verticals.map((x, i) => (
        <line
          key={`v-${i}`}
          x1={x}
          y1={0}
          x2={x}
          y2={height}
          stroke={color}
          strokeWidth={lineWidth}
        />
      ))}

      {/* Horizontal lines */}
      {horizontals.map((y, i) => (
        <line
          key={`h-${i}`}
          x1={0}
          y1={y}
          x2={width}
          y2={y}
          stroke={color}
          strokeWidth={lineWidth}
        />
      ))}

      {/* Cell dimension labels at top-left cell */}
      <text
        x={8}
        y={18}
        fill={color}
        fontSize={11}
        fontFamily="monospace"
        opacity={0.85}
      >
        {Math.round(width / columns)} × {Math.round(height / rows)} px / cell
      </text>
    </svg>
  );
}
