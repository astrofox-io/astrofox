interface AnimatedLogoProps {
  size?: number;
}

const DASH = "0.6 0.4";

export default function AnimatedLogo({ size = 120 }: AnimatedLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 980 983.87"
      width={size}
      height={size}
      className="block"
    >
      <style>{`
        @keyframes logo-dash {
          to { stroke-dashoffset: -2; }
        }
        .ld { animation: logo-dash 2.5s linear infinite; }
        .ld-1 { animation-delay: 0s; }
        .ld-2 { animation-delay: 0.4s; }
        .ld-3 { animation-delay: 0.8s; }
        .ld-4 { animation-delay: 1.2s; }
      `}</style>

      {/* Outer frame — left vertical */}
      <line
        x1="10.15" y1="780.53" x2="10.07" y2="397.31"
        fill="none" stroke="var(--color-primary)" strokeMiterlimit={10} strokeWidth={20}
        pathLength={1} strokeDasharray={DASH}
        className="ld ld-1"
      />

      {/* Outer frame — top + right + bottom-right */}
      <polyline
        points="10.07 397.24 10 14.73 489.93 205.39 969.85 14.73 969.92 397.27 970 780.6 490.08 972.92 490.01 972.88"
        fill="none" stroke="var(--color-primary)" strokeMiterlimit={10} strokeWidth={20}
        pathLength={1} strokeDasharray={DASH}
        className="ld ld-2"
      />

      {/* Inner zigzag path */}
      <polyline
        points="489.93 972.92 490.01 972.88 969.85 780.6 489.93 588.94 489.84 588.91 10.07 397.31 10 397.27 10.07 397.24 489.78 205.39 489.91 205.44 969.85 397.27 489.93 588.94 489.84 588.96 10.15 780.53 10 780.6 489.93 972.92"
        fill="none" stroke="var(--color-primary)" strokeLinejoin="round" strokeWidth={20}
        pathLength={1} strokeDasharray={DASH}
        className="ld ld-3"
      />

      {/* Center vertical lines */}
      <line x1="489.93" y1="972.92" x2="489.93" y2="972.85" fill="none" stroke="var(--color-primary)" strokeLinejoin="round" strokeWidth={20} pathLength={1} strokeDasharray={DASH} className="ld ld-4" />
      <line x1="489.93" y1="972.85" x2="489.84" y2="588.96" fill="none" stroke="var(--color-primary)" strokeLinejoin="round" strokeWidth={20} pathLength={1} strokeDasharray={DASH} className="ld ld-4" />
      <line x1="489.84" y1="588.96" x2="489.84" y2="588.91" fill="none" stroke="var(--color-primary)" strokeLinejoin="round" strokeWidth={20} pathLength={1} strokeDasharray={DASH} className="ld ld-4" />
      <line x1="489.84" y1="588.91" x2="489.78" y2="205.39" fill="none" stroke="var(--color-primary)" strokeLinejoin="round" strokeWidth={20} pathLength={1} strokeDasharray={DASH} className="ld ld-4" />
    </svg>
  );
}
