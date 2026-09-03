import React from "react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";

/**
 * @typedef {"primary" | "outline" | "outlinePrimary" | "ghost" | "danger" | "custom"} ButtonVariant
 * @typedef {"sm" | "md" | "lg"} ButtonSize
 */

const VARIANT_CLASSES = {
  primary:
    "bg-[var(--jb-primary)] text-white hover:bg-[var(--jb-accent-dark)] shadow-sm hover:shadow-md",
  outline:
    "bg-white dark:bg-transparent text-gray-700 border border-gray-300 hover:border-[var(--jb-primary)] hover:text-[var(--jb-primary)]",
  outlinePrimary:
    "bg-transparent text-[var(--jb-primary)] border border-[var(--jb-primary)] hover:bg-[var(--jb-bg-soft)]",
  ghost:
    "bg-transparent text-gray-600 hover:bg-[var(--jb-bg-soft)] hover:text-[var(--jb-primary)]",
  danger:
    "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  // No background/text color baked in — for the rare case (per-category
  // accent colors) where the caller supplies its own literal color
  // classes via `className`. Kept separate from `primary` so callers
  // never have to fight the cascade to override a preset color.
  custom: "",
};

const SIZE_CLASSES = {
  sm: "px-4 py-2 text-sm gap-1.5",
  md: "px-6 py-2.5 text-sm gap-2",
  lg: "px-7 py-3.5 text-base gap-2",
};

/**
 * Single source of truth for every call-to-action in the app — swaps
 * between a react-router `<Link>`, a plain `<a>`, or a `<button>`
 * depending on which prop is passed, so callers never have to repeat
 * the shared visual styles (or the `button-anim` hover treatment).
 *
 * @param {object} props
 * @param {ButtonVariant} [props.variant="primary"]
 * @param {ButtonSize} [props.size="md"]
 * @param {string} [props.to] - Internal route -> renders a router Link.
 * @param {string} [props.href] - External URL -> renders an <a>.
 * @param {React.ReactNode} [props.leftIcon]
 * @param {React.ReactNode} [props.rightIcon]
 * @param {boolean} [props.fullWidth]
 * @param {boolean} [props.loading]
 */
const Button = ({
  variant = "primary",
  size = "md",
  to,
  href,
  leftIcon,
  rightIcon,
  fullWidth = false,
  loading = false,
  disabled = false,
  className = "",
  children,
  ...rest
}) => {
  const classes = cn(
    "button-anim inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 whitespace-nowrap",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth && "w-full",
    (disabled || loading) && "opacity-60 pointer-events-none",
    className
  );

  const content = (
    <>
      {loading ? (
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!loading && rightIcon}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  );
};

export default Button;
