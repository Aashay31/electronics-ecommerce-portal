import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Building2,
  Globe,
  Eye,
  EyeOff,
  ArrowRight,
  Cpu,
  Wifi,
  Zap,
  CircuitBoard,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import InteractiveGrid from "../components/landing/InteractiveGrid";
import CursorGlow from "../components/landing/CursorGlow";

const initialState = {
  fullName: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  country: "",
};

/* ── Section definitions for progress indicator ── */
const sections = [
  { id: "personal", label: "Personal", fields: ["fullName", "email", "phoneNumber"] },
  { id: "security", label: "Security", fields: ["password", "confirmPassword"] },
  { id: "address", label: "Address", fields: ["street", "city", "state", "pincode", "country"] },
];

/* ── Floating visuals for left panel ── */
const floatingItems = [
  { Icon: Cpu, x: "18%", y: "25%", delay: 0 },
  { Icon: Wifi, x: "78%", y: "18%", delay: 1 },
  { Icon: Zap, x: "22%", y: "72%", delay: 2 },
  { Icon: CircuitBoard, x: "72%", y: "65%", delay: 3 },
];

const proofPoints = [
  "10,000+ electronics & components",
  "Trusted by 50,000+ makers",
  "Secure Razorpay payments",
  "AI-powered recommendations",
];

function Signup() {
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      await signup({
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
        },
      });
      toast.success("Account created successfully");
      navigate("/home");
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to create account";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* Compute active section based on which fields are filled */
  const getActiveSection = () => {
    for (let i = sections.length - 1; i >= 0; i--) {
      if (sections[i].fields.some((f) => formData[f])) return i;
    }
    return 0;
  };
  const activeSection = getActiveSection();

  /* Reusable input renderer */
  const InputField = ({ name, label, type = "text", icon: Icon, placeholder, isPassword, showPw, togglePw, half }) => (
    <div className={half ? "" : ""}>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">
          <Icon size={15} />
        </div>
        <input
          name={name}
          type={isPassword ? (showPw ? "text" : "password") : type}
          placeholder={placeholder}
          required
          value={formData[name]}
          onChange={handleChange}
          className="glow-input w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none"
        />
        {isPassword && (
          <button
            type="button"
            onClick={togglePw}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 transition-colors hover:text-slate-400"
          >
            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="landing-scrollbar flex min-h-screen bg-landing-dark font-inter text-landing-text">
      <CursorGlow />

      {/* ── LEFT PANEL ── */}
      <div className="relative hidden w-[48%] items-center justify-center overflow-hidden lg:flex">
        <InteractiveGrid />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-landing-dark/50" />

        {/* Floating icons */}
        {floatingItems.map(({ Icon, x, y, delay }, i) => (
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

        {/* Central content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 px-12 text-center"
        >
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
            <span className="text-lg font-bold text-indigo-400 tracking-wide">EM</span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Join the Electronics
            <br />
            <span className="text-gradient">Revolution</span>
          </h2>
          <p className="mt-3 max-w-sm mx-auto text-sm leading-relaxed text-slate-500">
            Create your account and start building with premium components
            trusted by makers worldwide.
          </p>

          {/* Social proof */}
          <div className="mt-10 space-y-3">
            {proofPoints.map((point, i) => (
              <motion.div
                key={point}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.12, duration: 0.4 }}
                className="flex items-center justify-center gap-2 text-xs text-slate-500"
              >
                <CheckCircle2 size={14} className="text-indigo-500/60 shrink-0" />
                {point}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── RIGHT PANEL: Signup form ── */}
      <div className="relative flex flex-1 items-center justify-center px-6 py-10 lg:px-10">
        <div className="pointer-events-none absolute -left-32 top-1/4 h-64 w-64 rounded-full bg-indigo-500/5 blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg"
        >
          {/* Mobile brand header */}
          <div className="mb-6 text-center lg:hidden">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
              <span className="text-sm font-bold text-indigo-400 tracking-wide">EM</span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">ElectroMart</p>
          </div>

          <div className="glass-card rounded-3xl p-7 sm:p-9">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
                Create account
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Join ElectroMart to save carts and manage orders.
              </p>
            </div>

            {/* Progress indicator */}
            <div className="mb-7 flex items-center gap-2">
              {sections.map((s, i) => (
                <div key={s.id} className="flex flex-1 items-center gap-2">
                  <div className="flex-1">
                    <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                      {s.label}
                    </div>
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-indigo-500"
                        initial={{ width: "0%" }}
                        animate={{
                          width: i <= activeSection ? "100%" : "0%",
                        }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Personal Info */}
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField name="fullName" label="Full Name" icon={User} placeholder="John Doe" />
                  <InputField name="email" label="Email" type="email" icon={Mail} placeholder="you@email.com" />
                </div>
                <InputField name="phoneNumber" label="Phone Number" type="tel" icon={Phone} placeholder="+91 98765 43210" />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[10px] uppercase tracking-wider text-slate-600">Security</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              {/* Security */}
              <div className="grid gap-4 sm:grid-cols-2">
                <InputField
                  name="password"
                  label="Password"
                  icon={Lock}
                  placeholder="Create password"
                  isPassword
                  showPw={showPassword}
                  togglePw={() => setShowPassword(!showPassword)}
                />
                <InputField
                  name="confirmPassword"
                  label="Confirm Password"
                  icon={Lock}
                  placeholder="Re-enter password"
                  isPassword
                  showPw={showConfirm}
                  togglePw={() => setShowConfirm(!showConfirm)}
                />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[10px] uppercase tracking-wider text-slate-600">Address</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              {/* Address */}
              <div className="space-y-4">
                <InputField name="street" label="Street Address" icon={MapPin} placeholder="123 Main Street" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField name="city" label="City" icon={Building2} placeholder="Mumbai" />
                  <InputField name="state" label="State" icon={Building2} placeholder="Maharashtra" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InputField name="pincode" label="Pincode" icon={MapPin} placeholder="400001" />
                  <InputField name="country" label="Country" icon={Globe} placeholder="India" />
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
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-400 transition hover:text-indigo-300 no-underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default Signup;
