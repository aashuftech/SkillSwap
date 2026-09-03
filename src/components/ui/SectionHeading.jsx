import React from "react";
import { cn } from "../../lib/cn";
import Badge from "./Badge";

/**
 * Consistent "eyebrow + title + subtitle" header used at the top of
 * most sections/pages (Hero, StartSwap, CTABanner, category pages...).
 * Centralising it means every section gets the same spacing/type
 * scale for free, and a global tweak only has to happen once here.
 *
 * @param {object} props
 * @param {string} [props.eyebrow] - Small label shown above the title, inside a Badge.
 * @param {React.ReactNode} [props.eyebrowIcon]
 * @param {string} props.title
 * @param {string} [props.subtitle]
 * @param {"left" | "center"} [props.align="center"]
 */
const SectionHeading = ({
  eyebrow,
  eyebrowIcon,
  title,
  subtitle,
  align = "center",
  className = "",
}) => {
  const alignment = align === "center" ? "text-center items-center mx-auto" : "text-left items-start";

  return (
    <div className={cn("flex flex-col mb-10 max-w-2xl", alignment, className)}>
      {eyebrow && (
        <Badge icon={eyebrowIcon} className="mb-4">
          {eyebrow}
        </Badge>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{title}</h2>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
    </div>
  );
};

export default SectionHeading;
