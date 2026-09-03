import React, { useEffect } from "react";
import { TrendingUp, Quote } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { GROWTH_JOURNEY } from "../data/growthJourney";
import { GROWTH_FEATURES } from "../data/pageFeatures";
import { Badge, Section, SectionHeading } from "../components/ui";
import FeatureGrid from "../components/FeatureGrid";
import CTABanner from "../components/CTABanner";
import RibbonBackground from "../components/RibbonBackground";

const Growth = () => {
  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-in-out", once: true });
  }, []);

  return (
    <div className="relative min-h-screen bg-[#FAF9FF] dark:bg-[#07070C] overflow-hidden transition-colors duration-300">
      <RibbonBackground variant="flow" />

      <div className="relative z-10">
        {/* Hero */}
        <Section tone="transparent" spacing="lg" className="text-center py-20">
          <Badge data-aos="fade-up" icon={<TrendingUp size={13} />} className="mx-auto mb-5">
            Personal Growth
          </Badge>
          <h1
            data-aos="fade-up"
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-5 max-w-3xl mx-auto tracking-tight"
          >
            Learn. Share. Evolve.
          </h1>
          <p
            data-aos="fade-up"
            className="text-gray-600 dark:text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            Growth isn't a solo project here — it happens in the back-and-forth of teaching someone and being taught in return.
          </p>
        </Section>

        {/* Journey timeline */}
        <Section tone="transparent" className="py-16">
          <SectionHeading title="What a typical journey looks like" align="center" className="mx-auto" />
          <div className="max-w-3xl mx-auto relative mt-10">
            <div className="absolute left-6 top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block" />
            <div className="space-y-8">
              {GROWTH_JOURNEY.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} data-aos="fade-up" className="relative flex gap-5 items-start">
                    <div className="jb-icon-chip relative z-10 w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-violet-600/25">
                      <Icon size={20} />
                    </div>
                    <div className="pt-1.5 p-5 rounded-2xl bg-white dark:bg-[#181824] border border-gray-200 dark:border-[#2C2C3E] shadow-sm grow">
                      <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
                        {step.stage}
                      </span>
                      <h3 className="font-bold text-gray-900 dark:text-white text-base mt-1">{step.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        {/* Why it works */}
        <Section tone="transparent" className="py-16">
          <SectionHeading title="Why members keep growing here" align="center" className="mx-auto" />
          <div className="mt-8">
            <FeatureGrid items={GROWTH_FEATURES} />
          </div>
        </Section>

        {/* Quote */}
        <Section tone="transparent" className="py-16">
          <div
            data-aos="fade-up"
            className="max-w-2xl mx-auto text-center p-8 rounded-3xl bg-white dark:bg-[#181824] border border-violet-200/80 dark:border-violet-900/60 shadow-lg"
          >
            <Quote size={28} className="text-violet-600 dark:text-violet-400 mx-auto mb-4 opacity-70" />
            <p className="text-lg md:text-xl font-medium text-gray-800 dark:text-gray-200 leading-relaxed">
              "The best way to know you've actually learned something is to try teaching it to someone else."
            </p>
          </div>
        </Section>

        <CTABanner />
      </div>
    </div>
  );
};

export default Growth;
