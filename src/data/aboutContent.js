import { Repeat, ShieldCheck, Gift } from "lucide-react";

/**
 * "What makes SkillSwap different" highlights on the About page.
 * `icon` is a component reference (lucide-react), rendered by the caller.
 */
export const DIFFERENTIATORS = [
  {
    icon: Repeat,
    title: "Two-way exchange",
    desc: "No one-sided courses. You teach what you know and learn something new in the same swap.",
  },
  {
    icon: ShieldCheck,
    title: "Real, accountable people",
    desc: "Verified profiles and ratings mean you always know who you're learning from.",
  },
  {
    icon: Gift,
    title: "Free to start",
    desc: "Creating a profile, browsing skills and messaging members costs nothing — ever.",
  },
];
