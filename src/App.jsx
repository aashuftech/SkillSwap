import React from "react";
import { BrowserRouter as Router, Navigate, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToHash from "./components/ScrollToHash";
import FloatingChat from "./components/FloatingChat";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import ExploreCategories from "./components/ExploreCategories";
import HowItWorks from "./components/HowItWorks";
import FeaturedSkills from "./components/FeaturedSkills";
import FeaturedMentors from "./components/FeaturedMentors";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import CTABanner from "./components/CTABanner";
import TrustStrip from "./components/TrustStrip";
import ExploreSkills from "./pages/ExploreSkills";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StartSwap from "./pages/StartSwap";
import AddSkill from "./pages/AddSkills";
import WebDevelopment from "./pages/WebDevelop";
import GraphicDesign from "./pages/GraphicDesign";
import LanguageExchange from "./pages/LanguageExchange";
import Music from "./pages/Music";
import DynamicCategoryPage from "./pages/DynamicCategoryPage";
import Community from "./pages/Community";
import Collaboration from "./pages/Collaboration";
import Growth from "./pages/Growth";
import Payments from "./pages/Payments";
import ChatPage from "./pages/ChatPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminSkillReview from "./pages/AdminSkillReview";
import AdminPlatformReviews from "./pages/AdminPlatformReviews";
import PublicProfile from "./pages/PublicProfile";
import PlatformReviewsPage from "./pages/PlatformReviewsPage";
import { VideoCallProvider } from "./context/VideoCallContext";
import IncomingCallModal from "./components/chat/IncomingCallModal";
import VideoCallModal from "./components/chat/VideoCallModal";
import ReviewPlatformCTA from "./components/ReviewPlatformCTA";
import { API } from "./lib/apiConfig.js";

function RequireAuth({ children }) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    return <Navigate replace to="/login" />;
  }
  return children;
}

function RequireAdmin({ children }) {
  const [state, setState] = React.useState({ checking: true, isAdmin: false });

  React.useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setState({ checking: false, isAdmin: false });
      return undefined;
    }

    // Check cached user first for instant transition
    try {
      const cached = JSON.parse(localStorage.getItem("skillswapUser") || "null");
      if (cached?.role === "ADMIN") {
        setState({ checking: false, isAdmin: true });
      }
    } catch {
      // ignore JSON parse error
    }

    const controller = new AbortController();
    fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("skillswapUser");
          }
          setState({ checking: false, isAdmin: false });
          return;
        }
        localStorage.setItem("skillswapUser", JSON.stringify(data.user));
        setState({ checking: false, isAdmin: data.user.role === "ADMIN" });
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setState((prev) => ({ ...prev, checking: false }));
      });

    return () => controller.abort();
  }, []);

  if (state.checking) {
    return (
      <main className="grid min-h-[45vh] place-items-center text-sm text-gray-500">
        Checking account access…
      </main>
    );
  }
  return state.isAdmin ? children : <Navigate replace to="/dashboard" />;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="jb-page-enter">
      <Routes location={location}>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <Stats />
              <ExploreCategories />
              <HowItWorks />
              <FeaturedSkills />
              <FeaturedMentors />
              <Testimonials />
              <FAQ />
              <CTABanner />
              <TrustStrip />
            </>
          }
        />
        <Route path="/explore" element={<ExploreSkills />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/start-swap" element={<StartSwap />} />
        <Route
          path="/add-skills"
          element={
            <RequireAuth>
              <AddSkill />
            </RequireAuth>
          }
        />
        {/* Category Pages */}
        <Route path="/web-development" element={<WebDevelopment />} />
        <Route path="/mobile-development" element={<DynamicCategoryPage categoryKey="mobileDevelopment" />} />
        <Route path="/ui-ux-design" element={<DynamicCategoryPage categoryKey="uiUxDesign" />} />
        <Route path="/graphic-design" element={<GraphicDesign />} />
        <Route path="/content-writing" element={<DynamicCategoryPage categoryKey="contentWriting" />} />
        <Route path="/seo" element={<DynamicCategoryPage categoryKey="seo" />} />
        <Route path="/digital-marketing" element={<DynamicCategoryPage categoryKey="digitalMarketing" />} />
        <Route path="/data-science" element={<DynamicCategoryPage categoryKey="dataScience" />} />
        <Route path="/video-editing" element={<DynamicCategoryPage categoryKey="videoEditing" />} />
        <Route path="/language-exchange" element={<LanguageExchange />} />
        <Route path="/music" element={<Music />} />
        <Route path="/others" element={<DynamicCategoryPage categoryKey="others" />} />
        <Route path="/category/:slug" element={<DynamicCategoryPage />} />

        {/* Other Pages */}
        <Route path="/platform-reviews" element={<PlatformReviewsPage />} />
        <Route path="/community" element={<Community />} />
        <Route path="/collaboration" element={<Collaboration />} />
        <Route path="/growth" element={<Growth />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <UserDashboard />
            </RequireAuth>
          }
        />
        <Route path="/profile/:id" element={<PublicProfile />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RequireAdmin>
              <AdminUsers />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/skills"
          element={
            <RequireAdmin>
              <AdminSkillReview />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <RequireAdmin>
              <AdminPlatformReviews />
            </RequireAdmin>
          }
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <VideoCallProvider>
        <Navbar />
        <ScrollToHash />
        <AnimatedRoutes />
        <FloatingChat />
        <IncomingCallModal />
        <VideoCallModal />
        <ReviewPlatformCTA />
        <Footer />
      </VideoCallProvider>
    </Router>
  );
}
