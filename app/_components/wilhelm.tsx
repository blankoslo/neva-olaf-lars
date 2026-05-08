/* Wilhelm Tyskeberge — W·T monogram + small badges. */

import type { CSSProperties, ReactNode } from "react";

export function Monogram({
  size = 44,
  ember = true,
  style = {},
}: {
  size?: number;
  ember?: boolean;
  style?: CSSProperties;
}) {
  const stroke = ember ? "var(--ember)" : "var(--bone)";
  const color = stroke;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `1.5px solid ${stroke === "var(--ember)" ? "#f4a259" : "#e9e3d3"}`,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: size * 0.38,
        letterSpacing: "0.06em",
        fontWeight: 500,
        boxShadow: ember ? "0 0 24px rgba(244,162,89,0.25)" : "none",
        flexShrink: 0,
        background: "rgba(10,15,28,0.4)",
        ...style,
      }}
    >
      W·T
    </div>
  );
}

/**
 * Backwards-compatible alias. Earlier pages import WilhelmAvatar — point it
 * at the Monogram so the redesign rolls through without touching every page.
 * The `variant` prop maps to the ember toggle.
 */
type AvatarVariant = "ink" | "kraft" | "bone" | "ember";
export function WilhelmAvatar({
  size = 44,
  variant = "ember",
  style = {},
}: {
  size?: number;
  variant?: AvatarVariant;
  style?: CSSProperties;
}) {
  const ember = variant === "ember" || variant === "kraft" || variant === "ink";
  return <Monogram size={size} ember={ember} style={style} />;
}

/**
 * Stamp — a small mono-cased badge. The new design uses these as eyebrow
 * captions ("KAPITTEL I", "WILHELMS VAL"). No paper-stamp rotation.
 */
export function Stamp({
  children,
  color = "var(--ember)",
  rotate,
}: {
  children: ReactNode;
  color?: string;
  rotate?: number;
}) {
  const transform = rotate !== undefined ? `rotate(${rotate}deg)` : undefined;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "'DM Mono', monospace",
        fontSize: 9,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color,
        padding: "4px 9px",
        border: `1px solid ${color}`,
        borderRadius: 3,
        transform,
        background: "transparent",
        fontWeight: 500,
      }}
    >
      {children}
    </span>
  );
}
