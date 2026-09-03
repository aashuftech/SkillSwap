import { BookOpen, Users, LineChart, Trophy } from "lucide-react";

/** The 4-stage "growth journey" timeline on the Growth page. */
export const GROWTH_JOURNEY = [
  {
    stage: "Week 1",
    icon: BookOpen,
    title: "Pick a skill to learn",
    desc: "Browse the community and find someone teaching what you've always wanted to learn.",
  },
  {
    stage: "Week 2-4",
    icon: Users,
    title: "Swap and practice",
    desc: "Meet regularly, practice together, and teach your own skill back in return.",
  },
  {
    stage: "Month 2",
    icon: LineChart,
    title: "See real progress",
    desc: "What felt unfamiliar starts clicking — you're applying it, not just watching tutorials.",
  },
  {
    stage: "Month 3+",
    icon: Trophy,
    title: "Pay it forward",
    desc: "Confident enough to teach beginners yourself, keeping the exchange going.",
  },
];
