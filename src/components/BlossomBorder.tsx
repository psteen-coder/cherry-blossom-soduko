type Bloom = {
  x: number;
  y: number;
  r: number;
  rotate: number;
};

function Bloom({ x, y, r, rotate }: Bloom) {
  const petals = [0, 72, 144, 216, 288];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      {petals.map((angle) => (
        <ellipse
          key={angle}
          cx={0}
          cy={-r * 0.58}
          rx={r * 0.36}
          ry={r * 0.72}
          fill="var(--blossom-petal)"
          stroke="var(--blossom-petal-stroke)"
          strokeWidth={0.6}
          transform={`rotate(${angle})`}
        />
      ))}
      <circle
        r={r * 0.2}
        fill="var(--blossom-center)"
        stroke="var(--blossom-center-stroke)"
        strokeWidth={0.4}
      />
    </g>
  );
}

const TOP_BLOOMS: Bloom[] = [
  { x: 28, y: 38, r: 11, rotate: -12 },
  { x: 86, y: 22, r: 9, rotate: 18 },
  { x: 150, y: 36, r: 13, rotate: -8 },
  { x: 220, y: 18, r: 10, rotate: 22 },
  { x: 290, y: 34, r: 12, rotate: -16 },
  { x: 360, y: 24, r: 9, rotate: 10 },
];

const BOTTOM_BLOOMS: Bloom[] = [
  { x: 40, y: 28, r: 12, rotate: 14 },
  { x: 120, y: 42, r: 9, rotate: -20 },
  { x: 200, y: 24, r: 13, rotate: 6 },
  { x: 275, y: 40, r: 10, rotate: -12 },
  { x: 350, y: 30, r: 11, rotate: 16 },
];

const SIDE_BLOOMS: Bloom[] = [
  { x: 32, y: 70, r: 10, rotate: -18 },
  { x: 22, y: 160, r: 12, rotate: 12 },
  { x: 36, y: 250, r: 9, rotate: -8 },
  { x: 24, y: 340, r: 11, rotate: 20 },
];

export default function BlossomBorder() {
  return (
    <div
      className="blossom-border"
      data-testid="blossom-border"
      aria-hidden="true"
    >
      <svg
        className="blossom-edge blossom-edge-top"
        data-testid="blossom-border-top"
        viewBox="0 0 400 64"
        preserveAspectRatio="none"
      >
        <path
          d="M0 54 C 40 10, 90 60, 140 28 S 220 8, 260 40 S 340 8, 400 36"
          fill="none"
          stroke="var(--blossom-vine)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M20 58 C 70 24, 110 50, 170 22 S 260 56, 320 26 S 370 50, 400 44"
          fill="none"
          stroke="var(--blossom-vine-soft)"
          strokeWidth="1.6"
        />
        {TOP_BLOOMS.map((bloom) => (
          <Bloom key={`${bloom.x}-${bloom.y}`} {...bloom} />
        ))}
      </svg>

      <svg
        className="blossom-edge blossom-edge-bottom"
        data-testid="blossom-border-bottom"
        viewBox="0 0 400 64"
        preserveAspectRatio="none"
      >
        <path
          d="M0 18 C 50 50, 110 8, 170 40 S 250 8, 310 36 S 360 58, 400 22"
          fill="none"
          stroke="var(--blossom-vine)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {BOTTOM_BLOOMS.map((bloom) => (
          <Bloom key={`${bloom.x}-${bloom.y}`} {...bloom} />
        ))}
      </svg>

      <svg
        className="blossom-edge blossom-edge-left"
        data-testid="blossom-border-left"
        viewBox="0 0 64 400"
        preserveAspectRatio="none"
      >
        <path
          d="M48 0 C 12 60, 52 120, 20 180 S 54 260, 24 320 S 40 370, 50 400"
          fill="none"
          stroke="var(--blossom-vine)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {SIDE_BLOOMS.map((bloom) => (
          <Bloom key={`L-${bloom.y}`} {...bloom} />
        ))}
      </svg>

      <svg
        className="blossom-edge blossom-edge-right"
        data-testid="blossom-border-right"
        viewBox="0 0 64 400"
        preserveAspectRatio="none"
      >
        <path
          d="M16 0 C 52 70, 10 130, 44 190 S 8 270, 40 330 S 20 370, 14 400"
          fill="none"
          stroke="var(--blossom-vine)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {SIDE_BLOOMS.map((bloom) => (
          <Bloom
            key={`R-${bloom.y}`}
            x={64 - bloom.x}
            y={bloom.y}
            r={bloom.r}
            rotate={-bloom.rotate}
          />
        ))}
      </svg>
    </div>
  );
}
