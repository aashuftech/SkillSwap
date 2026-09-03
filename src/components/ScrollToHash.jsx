import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scroll restoration and hash anchor handling for React Router.
 * - On normal page navigation (no hash): automatically scrolls window to the top (0, 0).
 * - On hash link (e.g. /explore#how-it-works): smoothly scrolls to the target anchor element.
 */
const ScrollToHash = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      // Scroll to the very top immediately on page change
      window.scrollTo(0, 0);
      document.documentElement.scrollTo(0, 0);
      document.body.scrollTo(0, 0);
    } else {
      const id = hash.replace("#", "");
      const timeout = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.scrollTo(0, 0);
        }
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToHash;

