/**
 * Joins conditional class names, filtering out falsy values.
 * A tiny dependency-free stand-in for `clsx` — this project only
 * ever needs the "join truthy strings" behaviour, so a 3rd-party
 * package would be overkill.
 *
 * @param  {...(string|false|null|undefined)} classes
 * @returns {string}
 *
 * @example
 * cn("btn", isActive && "btn-active", size === "lg" && "btn-lg")
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
