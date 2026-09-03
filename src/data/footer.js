/**
 * Footer link columns. Every path here already exists as a route in
 * App.jsx — no new pages were invented to fill out the layout.
 */
export const FOOTER_COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Browse Skills", path: "/explore" },
      { label: "How It Works", path: "/explore" },
      { label: "Pricing", path: "/payments" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", path: "/about" },
      { label: "Our Community", path: "/community" },
      { label: "Growth", path: "/growth" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Collaboration", path: "/collaboration" },
      { label: "Start Swapping", path: "/start-swap" },
      { label: "Add a Skill", path: "/add-skills" },
    ],
  },
];

/** Social links — `icon` is a component reference (react-icons/fa). */
import { FaFacebook, FaTwitter, FaLinkedin, FaGithub } from "react-icons/fa";

export const SOCIAL_LINKS = [
  { icon: FaTwitter, label: "Twitter", href: "/" },
  { icon: FaLinkedin, label: "LinkedIn", href: "/" },
  { icon: FaFacebook, label: "Facebook", href: "/" },
  { icon: FaGithub, label: "GitHub", href: "/" },
];
