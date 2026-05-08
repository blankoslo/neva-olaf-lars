/* Wilhelm avatar — soft sixpence cap, white moustache + beard, rosy cheeks. */

import type { CSSProperties, ReactNode } from "react";

type AvatarVariant = "ink" | "kraft" | "bone" | "ember";

export function WilhelmAvatar({
  size = 44,
  variant = "ink",
  style = {},
}: {
  size?: number;
  variant?: AvatarVariant;
  style?: CSSProperties;
}) {
  const bg: Record<AvatarVariant, string> = {
    ink: "#ede4d3",
    kraft: "#c9b896",
    bone: "#2a3128",
    ember: "#d97757",
  };

  const cap = "#1a1f1a";
  const capSh = "#0e1310";
  const skin = "#e8c8a4";
  const skinSh = "#c89a72";
  const beard = "#f3ecdb";
  const cheek = "#d97757";
  const ink = "#1a1f1a";

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg[variant],
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
        ...style,
      }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block" }}>
        <path d="M 26 56 Q 26 38 50 38 Q 74 38 74 56 Q 74 76 64 84 Q 50 92 36 84 Q 26 76 26 56 Z" fill={skin} />
        <ellipse cx="25" cy="62" rx="3" ry="4" fill={skin} />
        <ellipse cx="75" cy="62" rx="3" ry="4" fill={skin} />
        <path d="M 20 44 Q 22 22 50 22 Q 78 22 80 44 Q 80 50 72 50 L 28 50 Q 20 50 20 44 Z" fill={cap} />
        <path d="M 28 30 Q 50 24 72 30 Q 50 28 28 30 Z" fill={capSh} opacity="0.6" />
        <path d="M 24 48 Q 50 56 76 48 L 74 53 Q 50 60 26 53 Z" fill={capSh} />
        <ellipse cx="40" cy="56" rx="6" ry="2.4" fill={beard} />
        <ellipse cx="60" cy="56" rx="6" ry="2.4" fill={beard} />
        <circle cx="40" cy="60" r="1.6" fill={ink} />
        <circle cx="60" cy="60" r="1.6" fill={ink} />
        <path d="M 49 62 Q 47 70 50 72 Q 53 70 51 62 Z" fill={skinSh} opacity="0.6" />
        <circle cx="35" cy="68" r="3.6" fill={cheek} opacity="0.45" />
        <circle cx="65" cy="68" r="3.6" fill={cheek} opacity="0.45" />
        <path d="M 34 73 Q 42 70 50 72 Q 58 70 66 73 Q 62 78 50 76 Q 38 78 34 73 Z" fill={beard} />
        <path d="M 28 70 Q 28 90 50 96 Q 72 90 72 70 Q 70 80 64 84 Q 50 92 36 84 Q 30 80 28 70 Z" fill={beard} />
        <g stroke={skinSh} strokeWidth="0.5" opacity="0.4" fill="none">
          <path d="M 34 78 Q 36 86 38 92" />
          <path d="M 44 80 Q 44 88 44 94" />
          <path d="M 56 80 Q 56 88 56 94" />
          <path d="M 66 78 Q 64 86 62 92" />
        </g>
      </svg>
    </div>
  );
}

export function Stamp({
  children,
  color = "#b85a3c",
  rotate = -3,
}: {
  children: ReactNode;
  color?: string;
  rotate?: number;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "JetBrains Mono, monospace",
        fontSize: 9,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color,
        padding: "5px 10px",
        border: `2px solid ${color}`,
        borderRadius: 3,
        transform: `rotate(${rotate}deg)`,
        background: "rgba(217,119,87,0.04)",
      }}
    >
      {children}
    </div>
  );
}
