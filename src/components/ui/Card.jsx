import React from "react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";

/**
 * Base "white rounded panel" used for every listing card in the app
 * (category tiles, skill cards, mentor cards, swap listings...).
 * Renders as a Link when `to` is passed, otherwise a plain div, so
 * non-clickable cards (e.g. a stat block) can use it too.
 *
 * @param {object} props
 * @param {string} [props.to]
 * @param {boolean} [props.hoverable=true] - Lift + shadow on hover.
 * @param {string} [props.bg="bg-white"] - Background color class. A prop
 *   (not just `className`) because Tailwind utility precedence isn't
 *   determined by className order — two conflicting `bg-*` classes in
 *   the same string would fight based on generated CSS order, not
 *   JSX order, so the background needs a single dedicated slot.
 * @param {boolean} [props.clip=true] - Whether content outside the
 *   rounded border is clipped. Needed for photo cards (so the image
 *   respects the rounded corners) but must be turned off for cards
 *   that intentionally float a badge partly outside their edge (e.g.
 *   the numbered step badge in HowItWorks) — overflow-hidden would
 *   otherwise silently clip it.
 */
const Card = ({ to, hoverable = true, bg = "bg-white", clip = true, className = "", children, ...rest }) => {
  const classes = cn(
    "rounded-2xl shadow-sm",
    clip && "overflow-hidden",
    bg,
    hoverable && "transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
    className
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
};

export default Card;
