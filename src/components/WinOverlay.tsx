import type { ReactNode } from "react";

export const WIN_PETAL_COUNT = 16;

type Props = {
  timeLabel: string;
  glitter: boolean;
  children?: ReactNode;
};

export default function WinOverlay({ timeLabel, glitter, children }: Props) {
  const petals = [];
  for (let i = 0; i < WIN_PETAL_COUNT; i++) {
    petals.push(
      <span
        key={i}
        className={glitter ? "falling-petal glitter" : "falling-petal"}
        data-testid="win-petal"
        style={{
          left: `${(8 + i * 5.7) % 96}%`,
          animationDelay: `${-((i * 0.41) % 5)}s`,
          animationDuration: `${7 + (i % 5)}s`,
          fontSize: `${0.85 + (i % 4) * 0.28}rem`,
        }}
      >
        ✿
      </span>,
    );
  }

  return (
    <div
      className="win-overlay"
      data-testid="win-overlay"
      data-glitter={glitter ? "true" : "false"}
    >
      <div className="win-petals" aria-hidden="true">
        {petals}
      </div>
      <p className="win-overlay-time" data-testid="win-time">
        {timeLabel}
      </p>
      {children}
    </div>
  );
}
