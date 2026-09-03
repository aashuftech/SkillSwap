import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, User, MapPin, Eye, EyeOff, Sparkles, ShieldCheck, CheckCircle2, Award, Zap } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Button, FloatingInput } from "../components/ui";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
const SIGNUP_IMAGE = "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    geolocation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-in-out", once: true });
    // If already logged in, redirect to dashboard or admin
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const user = JSON.parse(localStorage.getItem("skillswapUser") || "{}");
        navigate(user.role === "ADMIN" ? "/admin" : "/dashboard", { replace: true });
      } catch {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${API}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          location: formData.geolocation.trim(),
        }),
      });
      const json = await response.json();

      if (response.ok && json.success) {
        localStorage.setItem("userEmail", formData.email.trim().toLowerCase());
        localStorage.setItem("authToken", json.authToken);
        localStorage.setItem("skillswapUser", JSON.stringify(json.user));
        window.dispatchEvent(new Event("authChange"));
        navigate(json.user?.role === "ADMIN" ? "/admin" : "/dashboard");
      } else {
        setErrorMessage(json.message || "Failed to create account. Please verify your details.");
      }
    } catch (error) {
      console.error("Signup failed", error);
      setErrorMessage("Could not connect to the API server. Please ensure the backend is running.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-linear-to-br from-slate-50 via-purple-50/40 to-indigo-50/30 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl shadow-purple-900/10 border border-purple-100/80 overflow-hidden grid lg:grid-cols-12 min-h-[660px]">
        
        {/* Left Form Section */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-white order-2 lg:order-1">
          <div className="max-w-md w-full mx-auto">
            
            {/* Form Header */}
            <div className="mb-7">
              <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 mb-3">
                <Sparkles size={13} /> Join SkillSwap
              </div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create your account</h1>
              <p className="mt-2 text-sm text-gray-500">
                Join our vibrant community and start exchanging skills today for free.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-5 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start gap-3">
                <div className="mt-0.5 shrink-0 text-red-500">⚠️</div>
                <div className="flex-1">{errorMessage}</div>
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <FloatingInput
                id="name"
                label="Full Name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />

              <FloatingInput
                id="email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="username"
                required
              />

              <div className="relative">
                <FloatingInput
                  id="password"
                  label="Password (min 8 chars)"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength="8"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1.5"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <FloatingInput
                id="geolocation"
                label="Location / City (e.g. Mumbai, Delhi, Remote)"
                value={formData.geolocation}
                onChange={handleChange}
                autoComplete="address-level2"
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={submitting}
                  className="rounded-xl! py-3.5! font-semibold shadow-lg shadow-violet-600/20 bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition"
                >
                  {submitting ? "Creating account..." : "Sign Up & Get Started"}
                </Button>
              </div>

              <p className="text-center text-gray-600 text-sm pt-4 border-t border-gray-100">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-violet-600 hover:text-violet-700 hover:underline">
                  Log in
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Right Side: Modern Interactive Visual Showcase */}
        <div className="hidden lg:flex lg:col-span-6 relative bg-linear-to-br from-violet-950 via-purple-900 to-indigo-950 p-10 flex-col justify-between overflow-hidden text-white order-1 lg:order-2">
          {/* Subtle background glow & mesh image */}
          <div className="absolute inset-0 opacity-25 mix-blend-overlay">
            <img src={SIGNUP_IMAGE} alt="Community collaborating" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-pink-500/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-violet-500/30 rounded-full blur-3xl pointer-events-none" />

          {/* Top header badge */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 backdrop-blur-md border border-white/15 text-xs font-semibold tracking-wide text-purple-200">
              <Award size={14} className="text-yellow-300" />
              <span>Skill-for-Skill Economy</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl text-white leading-tight">
              Unlock a world of <br />
              <span className="bg-linear-to-r from-violet-300 via-pink-200 to-amber-200 bg-clip-text text-transparent">
                limitless knowledge.
              </span>
            </h2>
            <p className="mt-3 text-sm text-purple-200/80 leading-relaxed max-w-sm">
              Teach web development, guitar, French, graphic design, or photography — and learn any skill you choose in exchange.
            </p>
          </div>

          {/* Floating Highlights & Testimonial Cards */}
          <div className="relative z-10 space-y-3.5 my-6">
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 transition duration-300 hover:bg-white/15 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-pink-500 to-rose-600 text-white font-bold shadow-md">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Direct 1-on-1 Swaps</h4>
                  <p className="text-xs text-purple-200/75">Chat, video call, and schedule swap sessions freely.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 transition duration-300 hover:bg-white/15 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-indigo-600 text-white font-bold shadow-md">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">AI Moderated & Safe</h4>
                  <p className="text-xs text-purple-200/75">Every skill submission is screened to maintain top community quality.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom stats banner */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-purple-200/80">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>Zero Subscription Fees</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles size={14} className="text-yellow-300" />
              <span>Instant AI Verification</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Signup;

