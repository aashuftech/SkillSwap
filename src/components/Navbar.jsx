import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { Button } from "./ui";
import { NAV_LINKS } from "../data/navigation";
import { authFetch, forceLogout } from "../lib/authFetch";

const Navbar = () => {
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem("authToken"));
      try { setUser(JSON.parse(localStorage.getItem("skillswapUser") || "null")); } catch { setUser(null); }
    };
    checkAuth();

    window.addEventListener("authChange", checkAuth);
    return () => window.removeEventListener("authChange", checkAuth);
  }, []);

  // While logged in, periodically re-validate the session with the server.
  // A banned account is force-logged-out here even if the person never
  // triggers another API call on the page they're sitting on.
  useEffect(() => {
    if (!isLoggedIn) return;
    const check = () => authFetch("/api/auth/me").catch(() => {});
    check();
    pollRef.current = setInterval(check, 4000);
    return () => clearInterval(pollRef.current);
  }, [isLoggedIn]);

  useEffect(() => {
    // Clean up reason without blocking alert
    const reason = sessionStorage.getItem("skillswapLogoutReason");
    if (reason) {
      sessionStorage.removeItem("skillswapLogoutReason");
      console.log("Logged out reason:", reason);
    }
  }, []);

  const handleLogout = () => forceLogout();

  const closeMenu = () => setMenuOpen(false);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/95 dark:shadow-black/30">
      <div className="container mx-auto flex min-h-[72px] max-w-7xl items-center justify-between px-6">
        {/* Left Section: Logo */}
        <Link to="/">
          <Logo />
        </Link>

        {/* Center Section: Menu (desktop) */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className={`jb-link font-medium ${
                location.pathname === link.path
                  ? "text-purple-600 active"
                  : "text-gray-600 hover:text-purple-600"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Section: Auth (desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          <ThemeToggle />
          {!isLoggedIn ? (
            <>
              <Button to="/login" variant="outline" size="sm">
                Log In
              </Button>
              <Button to="/signup" variant="primary" size="sm">
                Sign Up
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to={user?.role === "ADMIN" ? "/admin" : "/dashboard"}
                className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50/70 px-3 py-1.5 text-xs font-semibold text-violet-800 hover:bg-violet-100 transition"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-6 w-6 rounded-full object-cover border border-violet-300 shadow-xs"
                  />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-[11px] font-bold text-white">
                    {userInitial}
                  </span>
                )}
                <span className="max-w-[110px] truncate">{user?.name || "My Account"}</span>
                {user?.role === "ADMIN" && (
                  <span className="rounded-md bg-violet-200 px-1.5 py-0.5 text-[9px] font-bold text-violet-800">
                    ADMIN
                  </span>
                )}
              </Link>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Log Out
              </Button>
            </div>
          )}
        </div>

        {/* Mobile: theme toggle + menu button */}
        <div className="lg:hidden flex items-center gap-2">
          <ThemeToggle compact />
          <button
            className="text-gray-700 dark:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel — same links, exposed responsively */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-96 opacity-100 py-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col items-center gap-4 text-gray-700 font-medium px-6 pb-4 pt-1 border-t border-gray-100">
          {NAV_LINKS.map((link) => (
            <Link key={link.label} to={link.path} className="jb-link hover:text-purple-600 text-sm" onClick={closeMenu}>
              {link.label}
            </Link>
          ))}

          <div className="w-full pt-2 flex flex-col gap-2">
            {!isLoggedIn ? (
              <>
                <Button to="/login" variant="outline" fullWidth onClick={closeMenu}>
                  Log In
                </Button>
                <Button to="/signup" variant="primary" fullWidth onClick={closeMenu}>
                  Sign Up
                </Button>
              </>
            ) : (
              <>
                <Button
                  to={user?.role === "ADMIN" ? "/admin" : "/dashboard"}
                  variant="primary"
                  fullWidth
                  onClick={closeMenu}
                >
                  {user?.role === "ADMIN" ? "Admin Workspace" : "My Dashboard"}
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    closeMenu();
                    handleLogout();
                  }}
                >
                  Log Out
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
