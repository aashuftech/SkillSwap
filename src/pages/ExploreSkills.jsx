import React from "react";
import { Compass } from "lucide-react";
import HowItWorks from "../components/HowItWorks";
import FeaturedSkills from "../components/FeaturedSkills";
import FeaturedMentors from "../components/FeaturedMentors";
import CommunitySkills from "../components/CommunitySkills";
import { SectionHeading } from "../components/ui";
import RibbonBackground from "../components/RibbonBackground";

const ExploreSkills = () => {
  return (
    <div className="relative bg-[#FAF9FF] dark:bg-[#07070C] min-h-screen overflow-hidden transition-colors duration-300">
      <RibbonBackground variant="explore" />
      <div className="relative z-10 px-6 md:px-8 pt-16 pb-6">
        <SectionHeading
          eyebrow="Browse Skills"
          eyebrowIcon={<Compass size={13} />}
          title="Find your next skill to learn"
          subtitle="Every category below is taught by real members of the community — pick one to see who's teaching it and what they're looking to learn in return."
        />
      </div>
      <div className="relative z-10">
        <FeaturedSkills />
        <FeaturedMentors />
        <CommunitySkills />
        <HowItWorks />
      </div>
    </div>
  );
};

export default ExploreSkills;
