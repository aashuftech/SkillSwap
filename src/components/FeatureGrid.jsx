import React from "react";
import { Card } from "./ui";

/**
 * Simple responsive grid of "title + description" cards — the pattern
 * repeated (with only the copy changing) across the Community and
 * Growth pages.
 *
 * @param {object} props
 * @param {{title: string, desc: string}[]} props.items
 * @param {string} [props.columns="md:grid-cols-3"] - Tailwind grid-cols classes for larger screens.
 */
const FeatureGrid = ({ items, columns = "sm:grid-cols-2 md:grid-cols-3" }) => (
  <div className={`grid ${columns} gap-8 mt-10`}>
    {items.map((item) => (
      <Card key={item.title} hoverable className="p-6 text-left">
        <h3 className="font-semibold text-xl mb-2 text-gray-900">{item.title}</h3>
        <p className="text-gray-600 text-sm">{item.desc}</p>
      </Card>
    ))}
  </div>
);

export default FeatureGrid;
