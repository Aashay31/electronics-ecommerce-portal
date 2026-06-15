import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  Cpu,
  Wifi,
  Radio,
  CircuitBoard,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import InteractiveGrid from "../components/landing/InteractiveGrid";
import CursorGlow from "../components/landing/CursorGlow";

/* ── Floating tech keywords ────────────────────── */
const floatingWords = [
  { text: "IoT", x: "15%", y: "20%", delay: 0 },
  { text: "Arduino", x: "75%", y: "15%", delay: 1 },
  { text: "Robotics", x: "25%", y: "75%", delay: 2 },
  { text: "AI", x: "70%", y: "70%", delay: 3 },
  { text: "Sensors", x: "50%", y: "40%", delay: 4 },
  { text: "PCB", x: "85%", y: "45%", delay: 1.5 },
];

const floatingIcons = [
  { Icon: Cpu, x: "20%", y: "35%", delay: 0.5 },
  { Icon: Wifi, x: "80%", y: "30%", delay: 1.5 },
  { Icon: Radio, x: "30%", y: "60%", delay: 2.5 },
  { Icon: CircuitBoard, x: "65%", y: "55%", delay: 3.5 },
];

function Login() {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [loginMethod, setLoginMethod] = useState("email");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const payload =
        loginMethod === "phone"
          ? { phoneNumber: formData.identifier, password: formData.password }
          : { email: formData.identifier, password: formData.password };
      await login(payload);
      toast.success("Welcome back!");
      const redirectTo = location.state?.from?.pathname || "/home";
      navigate(redirectTo);
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to sign in. Try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    toast("Google login coming soon!", { icon: "🔜" });
  };

  return (
    <div className="landing-scrollbar flex min-h-screen bg-landing-dark font-inter text-landing-text">
      <CursorGlow />

      {/* ── LEFT PANEL: Immersive visual side ── */}
      <div className="relative hidden w-[55%] items-center justify-center overflow-hidden lg:flex">
        <InteractiveGrid />

        {/* Gradient overlays */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-landing-dark/50" />

        {/* Floating tech words */}
        {floatingWords.map(({ text, x, y, delay }) => (
          <motion.span
            key={text}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.08 }}
            transition={{ delay, duration: 1 }}
            className="absolute text-sm font-bold uppercase tracking-[0.3em] text-white select-none animate-float"
            style={{ left: x, top: y, animationDelay: `${delay}s` }}
          >
            {text}
          </motion.span>
        ))}

        {/* Floating icons */}
        {floatingIcons.map(({ Icon, x, y, delay }, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            transition={{ delay, duration: 1 }}
            className="absolute animate-float-slow text-indigo-400 select-none"
            style={{ left: x, top: y, animationDelay: `${delay}s` }}
          >
            <Icon size={28} />
          </motion.div>
        ))}

        {/* Central brand block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 text-center px-12"
        >
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <span className="text-lg font-bold text-indigo-400 tracking-wide">EM</span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Electro<span className="text-indigo-400">Mart</span>
          </h2>
          <p className="mt-3 max-w-sm mx-auto text-sm leading-relaxed text-slate-500">
            The premium electronics marketplace for makers, engineers, and
            innovators building the future.
          </p>

          {/* Mini Arduino illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-10 mx-auto"
          >
            <svg width="180" height="130" viewBox="0 0 260 200" fill="none" className="mx-auto opacity-30 animate-spin-slow" style={{ animationDuration: "30s" }}>
              <rect x="10" y="10" width="240" height="180" rx="12" fill="#1a3a2a" stroke="#2d5a3f" strokeWidth="2" />
              <path d="M30 50 H100 V80 H150 V50 H220" stroke="#3d7a5f" strokeWidth="1.5" fill="none" opacity="0.6" />
              <path d="M30 100 H80 V130 H180 V100 H220" stroke="#3d7a5f" strokeWidth="1.5" fill="none" opacity="0.6" />
              <rect x="95" y="65" width="70" height="50" rx="4" fill="#1a1a2e" stroke="#4a4a6a" strokeWidth="1" />
              <text x="130" y="95" textAnchor="middle" fill="#6366f1" fontSize="9" fontFamily="monospace" fontWeight="bold">ATmega328</text>
              {Array.from({ length: 14 }, (_, i) => (
                <rect key={`t${i}`} x={25 + i * 15} y="14" width="8" height="12" rx="1" fill="#c0c0c0" opacity="0.5" />
              ))}
              {Array.from({ length: 14 }, (_, i) => (
                <rect key={`b${i}`} x={25 + i * 15} y="174" width="8" height="12" rx="1" fill="#c0c0c0" opacity="0.5" />
              ))}
              <circle cx="200" cy="35" r="4" fill="#22c55e" opacity="0.7">
                <animate attributeName="opacity" values="0.3;0.7;0.3" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="215" cy="35" r="4" fill="#6366f1" opacity="0.6">
                <animate attributeName="opacity" values="0.2;0.6;0.2" dur="1.5s" repeatCount="indefinite" />
              </circle>
            </svg>
          </motion.div>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL: Login form ── */}
      <div className="relative flex flex-1 items-center justify-center px-6 py-12 lg:px-12">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute -left-32 top-1/4 h-64 w-64 rounded-full bg-indigo-500/5 blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile brand header */}
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <span className="text-sm font-bold text-indigo-400 tracking-wide">EM</span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              ElectroMart
            </p>
          </div>

          {/* Card */}
          <div className="glass-card rounded-3xl p-8 sm:p-10">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Sign in to access your saved carts, orders, and wishlist.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Login method toggle */}
              <div className="flex items-center gap-1 rounded-xl bg-white/[0.03] p-1 border border-white/5">
                <button
                  type="button"
                  onClick={() => setLoginMethod("email")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
                    loginMethod === "email"
                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                      : "text-slate-500 hover:text-slate-300 border border-transparent"
                  }`}
                >
                  <Mail size={14} />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod("phone")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all ${
                    loginMethod === "phone"
                      ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                      : "text-slate-500 hover:text-slate-300 border border-transparent"
                  }`}
                >
                  <Phone size={14} />
                  Phone
                </button>
              </div>

              {/* Identifier input */}
              <div>
                <label htmlFor="identifier" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {loginMethod === "phone" ? "Phone Number" : "Email Address"}
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                    {loginMethod === "phone" ? <Phone size={16} /> : <Mail size={16} />}
                  </div>
                  <input
                    id="identifier"
                    name="identifier"
                    type={loginMethod === "phone" ? "tel" : "email"}
                    placeholder={loginMethod === "phone" ? "Enter phone number" : "you@electromart.com"}
                    required
                    value={formData.identifier}
                    onChange={handleChange}
                    className="glow-input w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password input */}
              <div>
                <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
                    <Lock size={16} />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="glow-input w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-12 text-sm text-white placeholder:text-slate-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors hover:text-slate-400"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="mt-2 text-right">
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-slate-500 transition hover:text-indigo-400 no-underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-shimmer group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-400 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-landing-dark disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isSubmitting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[11px] uppercase tracking-wider text-slate-600">or continue with</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              {/* Google button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] py-3.5 text-sm font-semibold text-slate-300 transition-all hover:border-white/20 hover:bg-white/[0.06]"
              >
                <svg width="18" height="18" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                Continue with Google
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              New here?{" "}
              <Link
                to="/signup"
                className="font-semibold text-indigo-400 transition hover:text-indigo-300 no-underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Login;