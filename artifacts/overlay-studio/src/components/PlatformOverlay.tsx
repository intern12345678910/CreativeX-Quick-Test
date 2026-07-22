import { PlatformDef } from '@/types';

interface Props {
  width: number;
  height: number;
  platform: PlatformDef;
}

export default function PlatformOverlay({ width, height, platform }: Props) {
  const { aspectW, aspectH, accentColor, textColor, label } = platform;

  // Calculate safe zone rect within display area
  const platformAR = aspectW / aspectH;
  const displayAR = width / height;

  let safeW: number, safeH: number, safeX: number, safeY: number;

  if (platformAR < displayAR) {
    // Platform is more portrait than display → bars on left/right
    safeH = height;
    safeW = height * platformAR;
    safeX = (width - safeW) / 2;
    safeY = 0;
  } else if (platformAR > displayAR) {
    // Platform is more landscape than display → bars on top/bottom
    safeW = width;
    safeH = width / platformAR;
    safeX = 0;
    safeY = (height - safeH) / 2;
  } else {
    // Same ratio — full image is safe
    safeW = width;
    safeH = height;
    safeX = 0;
    safeY = 0;
  }

  const borderW = 3;
  const labelH = 28;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
      data-testid="platform-overlay"
    >
      <defs>
        {/* Cutout mask for the safe zone */}
        <mask id="safe-mask">
          <rect width={width} height={height} fill="white" />
          <rect x={safeX} y={safeY} width={safeW} height={safeH} fill="black" />
        </mask>
      </defs>

      {/* Dark scrim outside safe zone */}
      <rect
        width={width}
        height={height}
        fill="rgba(0,0,0,0.62)"
        mask="url(#safe-mask)"
      />

      {/* Safe zone border */}
      <rect
        x={safeX + borderW / 2}
        y={safeY + borderW / 2}
        width={safeW - borderW}
        height={safeH - borderW}
        fill="none"
        stroke={accentColor}
        strokeWidth={borderW}
      />

      {/* Corner ticks */}
      {[
        [safeX, safeY],
        [safeX + safeW, safeY],
        [safeX, safeY + safeH],
        [safeX + safeW, safeY + safeH],
      ].map(([cx, cy], i) => {
        const tickLen = 14;
        const dx = i % 2 === 0 ? 1 : -1;
        const dy = i < 2 ? 1 : -1;
        return (
          <g key={i}>
            <line
              x1={cx}
              y1={cy}
              x2={cx + dx * tickLen}
              y2={cy}
              stroke={accentColor}
              strokeWidth={borderW + 1}
              strokeLinecap="round"
            />
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy + dy * tickLen}
              stroke={accentColor}
              strokeWidth={borderW + 1}
              strokeLinecap="round"
            />
          </g>
        );
      })}

      {/* Platform label badge — bottom of safe zone */}
      {safeH > labelH + 10 && (
        <>
          <rect
            x={safeX}
            y={safeY + safeH - labelH}
            width={safeW}
            height={labelH}
            fill={accentColor}
            opacity={0.92}
          />
          <text
            x={safeX + safeW / 2}
            y={safeY + safeH - labelH / 2 + 1}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={textColor}
            fontSize={12}
            fontWeight="700"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="0.06em"
          >
            {label.toUpperCase()}
          </text>
        </>
      )}

      {/* Ratio badge — top-right corner of safe zone */}
      <rect
        x={safeX + safeW - 52}
        y={safeY + 8}
        width={44}
        height={20}
        rx={4}
        fill="rgba(0,0,0,0.65)"
      />
      <text
        x={safeX + safeW - 30}
        y={safeY + 18}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={accentColor}
        fontSize={10}
        fontWeight="700"
        fontFamily="monospace"
      >
        {aspectW}:{aspectH}
      </text>
    </svg>
  );
}
