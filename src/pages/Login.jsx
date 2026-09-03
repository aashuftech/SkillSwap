import { API } from "../lib/apiConfig.js";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, Users, Compass } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Button, FloatingInput } from "../components/ui";

const LOGIN_IMAGE = "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-in-out", once: true });
    
    // Check if user was logged out due to ban or expiration
    const reason = sessionStorage.getItem("skillswapLogoutReason");
    if (reason) {
      setErrorMessage(reason);
      sessionStorage.removeItem("skillswapLogoutReason");
    }

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
      const response = await fetch(`${API}/api/loginuser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email.trim(), password: formData.password }),
      });
      const json = await response.json();

      if (response.ok && json.success) {
        localStorage.setItem("userEmail", formData.email.trim().toLowerCase());
        localStorage.setItem("authToken", json.authToken);
        localStorage.setItem("skillswapUser", JSON.stringify(json.user));
        window.dispatchEvent(new Event("authChange"));
        navigate(json.user?.role === "ADMIN" ? "/admin" : "/dashboard");
      } else {
        setErrorMessage(json.message || "Invalid email or password. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login failed", error);
      setErrorMessage("Could not connect to the API server. Please ensure the backend is running.");
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (email, password) => {
    setFormData({ email, password });
    setErrorMessage("");
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-linear-to-br from-slate-50 via-purple-50/40 to-indigo-50/30 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl shadow-purple-900/10 border border-purple-100/80 overflow-hidden grid lg:grid-cols-12 min-h-[620px]">
        
        {/* Left Side: Modern Interactive Visual Showcase */}
        <div className="hidden lg:flex lg:col-span-6 relative bg-linear-to-br from-violet-950 via-purple-900 to-indigo-950 p-10 flex-col justify-between overflow-hidden text-white">
          {/* Subtle background glow & mesh image */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay">
            <img src={LOGIN_IMAGE} alt="Learning community" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-violet-500/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl pointer-events-none" />

          {/* Top header badge */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 backdrop-blur-md border border-white/15 text-xs font-semibold tracking-wide text-purple-200">
              <Sparkles size={14} className="text-yellow-300" />
              <span>SkillSwap Community Platform</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight sm:text-4xl text-white leading-tight">
              Teach what you love. <br />
              <span className="bg-linear-to-r from-violet-300 via-purple-200 to-pink-300 bg-clip-text text-transparent">
                Learn what you need.
              </span>
            </h2>
            <p className="mt-3 text-sm text-purple-200/80 leading-relaxed max-w-sm">
              Connect with passionate creators, developers, designers, and thinkers worldwide in reciprocal skill exchanges.
            </p>
          </div>

          {/* Floating Highlights & Testimonial Cards */}
          <div className="relative z-10 space-y-3.5 my-6">
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 transition duration-300 hover:bg-white/15 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-purple-600 text-white font-bold shadow-md">
                  <Compass size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Smart AI Matchmaking</h4>
                  <p className="text-xs text-purple-200/75">Find the perfect skill counterpart in seconds with Groq AI.</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 transition duration-300 hover:bg-white/15 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-white font-bold shadow-md">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">100% Peer-to-Peer & Free</h4>
                  <p className="text-xs text-purple-200/75">Exchange expertise directly without expensive course fees.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom stats banner */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-purple-200/80">
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-purple-300" />
              <span>10,000+ Active Swappers</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>Verified Moderation</span>
            </div>
          </div>
        </div>

        {/* Right Side: Clean Modern Form */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            
            {/* Form Header */}
            <div className="mb-8">
              <div className="inline-flex lg:hidden items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 mb-4">
                <Sparkles size={13} /> SkillSwap
              </div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
              <p className="mt-2 text-sm text-gray-500">
                Enter your details to access your account and continue learning.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-start gap-3">
                <div className="mt-0.5 shrink-0 text-red-500">⚠️</div>
                <div className="flex-1">{errorMessage}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <FloatingInput
                  id="email"
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="relative">
                <FloatingInput
                  id="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
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

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600 text-xs sm:text-sm">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                  />
                  Remember me
                </label>
                <span className="text-xs text-violet-600 hover:text-violet-700 cursor-pointer font-medium">
                  Forgot password?
                </span>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={submitting}
                className="rounded-xl! py-3.5! font-semibold shadow-lg shadow-violet-600/20 bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition"
              >
                {submitting ? "Logging in..." : "Log In to Account"}
              </Button>

              {/* Demo Account Fillers for Quick Testing */}
              <div className="pt-2">
                <p className="text-center text-xs text-gray-400 mb-2">Quick test login:</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemoAccount("annu@gmail.com", "Khwaab8485")}
                    className="flex-1 py-1.5 px-3 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-100 text-xs font-medium text-purple-700 transition text-center"
                  >
                    👑 Demo Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount("aman@example.com", "Password123")}
                    className="flex-1 py-1.5 px-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-700 transition text-center"
                  >
                    👤 Demo User
                  </button>
                </div>
              </div>

              <p className="text-center text-gray-600 text-sm pt-4 border-t border-gray-100">
                Don't have an account yet?{" "}
                <Link to="/signup" className="font-semibold text-violet-600 hover:text-violet-700 hover:underline">
                  Sign up for free
                </Link>
              </p>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;

