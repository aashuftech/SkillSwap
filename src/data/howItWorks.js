import { UserPlus, Search, Repeat, Rocket } from "lucide-react";

export const HOW_IT_WORKS_STEPS = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Profile",
    desc: "Sign up and tell us about your skills and what you want to learn.",
    path: "/login",
  },
  {
    number: "02",
    icon: Search,
    title: "Explore Skills",
    desc: "Discover skills and find the perfect match for your learning goals.",
    path: "/explore",
  },
  {
    number: "03",
    icon: Repeat,
    title: "Start Swapping",
    desc: "Connect with people and schedule your learning sessions.",
    path: "/start-swap",
  },
  {
    number: "04",
    icon: Rocket,
    title: "Grow Together",
    desc: "Share knowledge, build relationships, and grow together.",
    path: "/growth",
  },
];
