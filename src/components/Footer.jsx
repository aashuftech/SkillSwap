import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import Logo from "./Logo";
import { FOOTER_COLUMNS, SOCIAL_LINKS } from "../data/footer";

const Footer = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, easing: "ease-in-out", once: true });
  }, []);

  return (
    <footer data-aos="fade-up" className="bg-white border-t border-gray-100 mt-10">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2">
            <Logo />
            <p className="text-gray-500 text-sm mt-4 max-w-xs">
              © {new Date().getFullYear()} SkillSwap. All rights reserved.
            </p>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.path} className="jb-link text-gray-500 hover:text-[var(--jb-primary)] text-sm transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-sm">Follow Us</h4>
            <div className="flex gap-3 text-gray-500 text-lg">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.label}
                    to={social.href}
                    aria-label={social.label}
                    className="hover:text-[var(--jb-primary)] transition-transform transform hover:scale-110"
                  >
                    <Icon />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
