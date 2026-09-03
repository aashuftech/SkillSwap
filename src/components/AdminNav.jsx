import { Link, useLocation } from "react-router-dom";
import { ClipboardCheck, LayoutDashboard, Users, Star, MessageSquareHeart } from "lucide-react";

const TABS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Users Directory", icon: Users },
  { to: "/admin/skills", label: "Skill Review", icon: ClipboardCheck },
  { to: "/admin/skills?featured=true", label: "⭐ Featured This Week", icon: Star },
  { to: "/admin/reviews", label: "💬 Website Reviews", icon: MessageSquareHeart },
];

export default function AdminNav() {
  const location = useLocation();
  const currentUrl = location.pathname + location.search;

  return (
    <nav className="mt-6 flex flex-wrap gap-2">
      {TABS.map(({ to, label, icon: Icon, exact }) => {
        const active = exact
          ? currentUrl === to
          : to.includes("?")
          ? currentUrl.includes(to)
          : location.pathname === to && !location.search.includes("featured=true");

        return (
          <Link
            key={to}
            to={to}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              active
                ? "bg-violet-600 text-white shadow-sm"
                : "border border-white/20 bg-white/10 text-white/80 hover:bg-white/15"
            }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
