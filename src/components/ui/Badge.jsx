import React from "react";
import { cn } from "../../lib/cn";

/**
 * @typedef {"soft" | "solid" | "outline"} BadgeTone
 */

const TONE_CLASSES = {
  soft: "bg-[var(--jb-bg-soft)] text-[var(--jb-primary)]",
  solid: "bg-[var(--jb-primary)] text-white",
  outline: "border border-[var(--jb-primary)]/40 text-[var(--jb-primary)]",
};

/**
 * Small pill used for eyebrow labels, category tags and status chips
 * (e.g. "LEARN. TEACH. GROW TOGETHER", "Live swap requests").
 *
 * @param {object} props
 * @param {BadgeTone} [props.tone="soft"]
 * @param {React.ReactNode} [props.icon]
 */
const Badge = ({ tone = "soft", icon, className = "", children, ...rest }) => (
  <span
    className={cn(
      "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full",
      TONE_CLASSES[tone],
      className
    )}
    {...rest}
  >
    {icon}
    {children}
  </span>
);

export default Badge;
