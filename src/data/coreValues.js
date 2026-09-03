import { Globe2, HeartHandshake, TrendingUp } from "lucide-react";

/** `icon` is a lucide-react component reference (not emoji) so it can
 * be styled consistently with the rest of the icon-chip system. */
export const CORE_VALUES = [
  {
    title: "Community",
    desc: "Connecting learners and teachers across the world.",
    icon: Globe2,
    path: "/community",
  },
  {
    title: "Collaboration",
    desc: "Learning together through real interaction and teamwork.",
    icon: HeartHandshake,
    path: "/collaboration",
  },
  {
    title: "Growth",
    desc: "Empowering people to develop personally and professionally.",
    icon: TrendingUp,
    path: "/growth",
  },
];
