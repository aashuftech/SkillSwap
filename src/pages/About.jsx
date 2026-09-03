import { API } from "../lib/apiConfig.js";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Quote } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { CORE_VALUES } from "../data/coreValues";
import { DIFFERENTIATORS } from "../data/aboutContent";
import { HOME_STATS, formatStatsList } from "../data/stats";
import { FEATURED_MENTORS } from "../data/mentors";
import { Badge, Card, Section, SectionHeading } from "../components/ui";
import CountUp from "../components/CountUp";
import CTABanner from "../components/CTABanner";
import RibbonBackground from "../components/RibbonBackground";


const STORY_IMAGE =
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80";

const About = () => {
  const [statsList, setStatsList] = useState(HOME_STATS);

  useEffect(() => {
    AOS.init({ duration: 1000, easing: "ease-in-out", once: true });

    let isMounted = true;
    fetch(`${API}/api/stats`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.stats) {
          setStatsList(formatStatsList(data.stats));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="relative bg-[#FAF9FF] dark:bg-[#07070C] min-h-screen overflow-hidden transition-colors duration-300">
      {/* Exact Flowing Ribbon Background */}
      <RibbonBackground variant="flow" />

      <div className="relative z-10">
        {/* Hero */}
        <Section tone="transparent" spacing="lg" className="text-center py-20">
          <Badge data-aos="fade-up" icon={<Heart size={13} />} className="mx-auto mb-5">
            About SkillSwap
          </Badge>
          <h1 data-aos="fade-up" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 max-w-4xl mx-auto tracking-tight">
            Skills grow when they're shared.
          </h1>
          <p data-aos="fade-up" className="text-gray-600 dark:text-gray-300 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-14">
            SkillSwap is a community where knowledge moves both ways — you teach
            what you know, and learn something new in return. No tuition, no
            one-sided courses, just people helping people grow.
          </p>

          <div data-aos="fade-up" className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {statsList.map((stat) => (
              <div key={stat.label} className="p-4 rounded-2xl bg-white dark:bg-[#181824] border border-gray-200 dark:border-[#2C2C3E] shadow-sm">
                <p className="text-3xl md:text-4xl font-bold text-violet-600 dark:text-violet-400">
                  <CountUp value={stat.value} />
                </p>
                <p className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 mt-1.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Story */}
        <Section tone="transparent" className="py-18">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <img
              data-aos="fade-right"
              src={STORY_IMAGE}
              alt="People collaborating"
              className="w-full lg:w-1/2 rounded-3xl shadow-xl object-cover h-88 lg:h-96 ring-1 ring-gray-200 dark:ring-gray-800"
            />
            <div data-aos="fade-left" className="lg:w-1/2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Why we built this</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-base leading-relaxed">
                Traditional learning often feels one-sided — pay, sit, absorb.
                We wanted something more honest: a place where teaching and
                learning happen in the same conversation, and everyone brings
                something valuable to the table.
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                Whether you're a total beginner or years into your craft,
                there's always someone nearby who wants to learn what you know
                — and something you've always wanted to pick up yourself.
              </p>
            </div>
          </div>
        </Section>

        {/* Differentiators */}
        <Section tone="transparent" className="py-18">
          <SectionHeading title="What makes SkillSwap different" align="center" className="mx-auto" />
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {DIFFERENTIATORS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} data-aos="fade-up" className="p-8 text-center rounded-3xl border border-gray-200 dark:border-[#2C2C3E] bg-white dark:bg-[#181824] shadow-sm hover:border-violet-500 hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto mb-4 shadow-xs">
                    <Icon size={26} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Core values */}
        <Section tone="transparent" className="py-18">
          <SectionHeading title="What we stand for" align="center" className="mx-auto" />
          <div data-aos="fade-up" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {CORE_VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <Link
                  key={value.title}
                  to={value.path}
                  className="group relative overflow-hidden bg-white dark:bg-[#181824] border border-gray-200 dark:border-[#2C2C3E] rounded-3xl shadow-sm hover:shadow-xl hover:border-violet-500 transition-all duration-300 p-8"
                >
                  <span className="absolute top-0 left-0 h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-violet-600 to-indigo-600 transition-transform duration-300 group-hover:scale-x-100" />
                  <div className="w-14 h-14 rounded-2xl bg-violet-600 flex items-center justify-center mb-5 text-white shadow-md transition-transform duration-300 group-hover:scale-110">
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{value.desc}</p>
                </Link>
              );
            })}
          </div>
        </Section>

        {/* Voice from the community */}
        <Section tone="transparent" className="py-18">
          <div className="max-w-3xl mx-auto text-center">
            <Quote size={36} className="text-violet-600 dark:text-violet-400 mx-auto mb-4 opacity-70" />
            <p className="text-xl md:text-2xl font-medium text-gray-800 dark:text-gray-200 leading-relaxed mb-6">
              "I taught someone React for three weeks and picked up conversational
              Spanish in return. I couldn't have afforded either as a paid course."
            </p>
            <div className="flex items-center justify-center gap-3">
              <img
                src={FEATURED_MENTORS[1].img}
                alt={FEATURED_MENTORS[1].name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-violet-200 dark:ring-violet-800"
              />
              <div className="text-left">
                <p className="font-bold text-gray-900 dark:text-white text-base">{FEATURED_MENTORS[1].name}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">{FEATURED_MENTORS[1].role} on SkillSwap</p>
              </div>
            </div>
          </div>
        </Section>

        <CTABanner />
      </div>
    </div>
  );
};

export default About;
