import React from "react";
import { cn } from "../../lib/cn";

/**
 * Every section on the homepage repeats the same
 * `max-w-7xl mx-auto px-6 md:px-8 py-16` shell with only the
 * background color changing. Centralising that shell here means a
 * future spacing/width tweak is a one-line change instead of a
 * find-and-replace across a dozen files.
 *
 * @param {object} props
 * @param {"white" | "soft" | "transparent"} [props.tone="white"]
 * @param {"sm" | "md" | "lg"} [props.spacing="md"] - Vertical padding.
 */
const TONE_CLASSES = {
  white: "bg-white dark:bg-transparent",
  soft: "bg-[var(--jb-bg)]",
  transparent: "",
};

const SPACING_CLASSES = {
  sm: "py-10",
  md: "py-16",
  lg: "py-24",
};

const Section = ({
  tone = "white",
  spacing = "md",
  className = "",
  innerClassName = "",
  children,
  ...rest
}) => (
  <section className={cn(TONE_CLASSES[tone], SPACING_CLASSES[spacing], "px-6 md:px-8", className)} {...rest}>
    <div className={cn("max-w-7xl mx-auto", innerClassName)}>{children}</div>
  </section>
);

export default Section;
