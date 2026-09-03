/**
 * Primary navigation — single source of truth shared by the desktop
 * nav bar and the mobile slide-down menu so the two never drift.
 * @type {{label: string, path: string}[]}
 */
export const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Browse Skills", path: "/explore" },
  { label: "How It Works", path: "/explore#how-it-works" },
  { label: "Add a Skill", path: "/add-skills" },
  { label: "Pricing", path: "/payments" },
  { label: "About Us", path: "/about" },
];
