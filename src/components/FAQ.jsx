import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { HOME_FAQS } from "../data/faqs";
import { Section, SectionHeading } from "./ui";
import { cn } from "../lib/cn";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <Section tone="white">
      <SectionHeading
        eyebrow="FAQ"
        eyebrowIcon={<HelpCircle size={13} />}
        title="Questions members ask us"
        subtitle="Quick answers before you dive in. Still unsure? The AI chat in the corner can help too."
      />
      <div className="max-w-3xl mx-auto divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
        {HOME_FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={faq.question}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[var(--jb-bg-soft)] transition-colors"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-gray-900 text-sm md:text-base">{faq.question}</span>
                <ChevronDown
                  size={18}
                  className={cn("text-gray-400 shrink-0 transition-transform duration-300", isOpen && "rotate-180 text-[var(--jb-primary)]")}
                />
              </button>
              <div className={cn("grid transition-all duration-300 ease-in-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 text-sm text-gray-600 leading-6">{faq.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
};

export default FAQ;
