import React, { useEffect } from "react";
import { Users, Sparkles } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import FeatureGrid from "../components/FeatureGrid";
import { COMMUNITY_FEATURES } from "../data/pageFeatures";
import { Badge } from "../components/ui";
import RibbonBackground from "../components/RibbonBackground";

const Community = () => {
  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-in-out", once: true });
  }, []);

  return (
    <div className="relative min-h-screen bg-[#FAF9FF] dark:bg-[#07070C] py-20 px-6 md:px-16 overflow-hidden transition-colors duration-300">
      <RibbonBackground variant="flow" />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <Badge data-aos="fade-up" icon={<Users size={13} />} className="mx-auto mb-5">
          Global Community
        </Badge>
        <h1
          data-aos="fade-up"
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-5 text-gray-900 dark:text-white tracking-tight"
        >
          Our Community
        </h1>
        <p
          data-aos="fade-up"
          className="text-gray-600 dark:text-gray-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-14 leading-relaxed"
        >
          Join a thriving network of learners, mentors, and creators who believe in exchanging knowledge and growing together.
        </p>

        <FeatureGrid items={COMMUNITY_FEATURES} />
      </div>
    </div>
  );
};

export default Community;
