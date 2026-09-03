import React from "react";
import { TRUST_ITEMS } from "../data/trustItems";
import { Section } from "./ui";

const TrustStrip = () => {
  return (
    <Section tone="white" spacing="sm">
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
        {TRUST_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex items-start gap-3">
              <div className="bg-[var(--jb-bg-soft)] rounded-full p-2.5 shrink-0">
                <Icon size={22} className="text-[var(--jb-primary)]" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
};

export default TrustStrip;
