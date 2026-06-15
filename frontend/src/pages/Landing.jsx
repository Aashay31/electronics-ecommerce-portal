import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Bot,
  CreditCard,
  PackageSearch,
  GitCompare,
  Heart,
  MessageSquare,
  Zap,
  Search,
  ShoppingCart,
  Truck,
  ArrowRight,
  Star,
  Clock,
  CheckCircle2,
} from "lucide-react";

import InteractiveGrid from "../components/landing/InteractiveGrid";
import FloatingParticles from "../components/landing/FloatingParticles";
import CursorGlow from "../components/landing/CursorGlow";
import ArduinoVisualization from "../components/landing/ArduinoVisualization";
import LandingNavbar from "../components/landing/LandingNavbar";
import LandingFooter from "../components/landing/LandingFooter";
import FeatureCard from "../components/landing/FeatureCard";
import AnimatedCounter from "../components/landing/AnimatedCounter";

/* ── Animation variants ────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ── Feature data ──────────────────────────────── */
const features = [
  { icon: ShieldCheck, title: "Secure Payments", description: "End-to-end encrypted transactions with enterprise-grade security and fraud protection." },
  { icon: Bot, title: "AI Shopping Assistant", description: "Smart product recommendations powered by AI that understand your project requirements." },
  { icon: CreditCard, title: "Razorpay Integration", description: "Seamless Indian payments with UPI, cards, net banking, and EMI options." },
  { icon: PackageSearch, title: "Smart Order Tracking", description: "Real-time shipment updates with intelligent delivery predictions and notifications." },
  { icon: GitCompare, title: "Product Comparison", description: "Side-by-side specs analysis to find the perfect component for your build." },
  { icon: Heart, title: "Wishlist System", description: "Save, organize, and share your favorite electronics for future projects." },
  { icon: MessageSquare, title: "AI Chat Support", description: "24/7 intelligent assistance for technical queries and order support." },
  { icon: Zap, title: "Electronics Picks", description: "Personalized recommendations curated for your ongoing projects and skill level." },
];

/* ── Stats ─────────────────────────────────────── */
const stats = [
  { value: 10000, suffix: "+", label: "Products" },
  { value: 50000, suffix: "+", label: "Makers" },
  { value: 99, suffix: ".9%", label: "Uptime" },
  { value: 4900, suffix: "", label: "Rating", displayOverride: "4.9★" },
];

/* ── How it works steps ────────────────────────── */
const steps = [
  { icon: Search, title: "Browse & Discover", description: "Explore thousands of curated electronics, from Arduino boards to advanced IoT sensors." },
  { icon: ShoppingCart, title: "Add to Cart", description: "Compare specs, read reviews, and add exactly what you need for your project." },
  { icon: Truck, title: "Fast Delivery", description: "Secure checkout with Razorpay and get your components delivered quickly." },
];

/* ── Trust badges ──────────────────────────────── */
const trustBadges = [
  { icon: ShieldCheck, label: "Secure" },
  { icon: Truck, label: "Fast Shipping" },
  { icon: Clock, label: "24/7 Support" },
  { icon: CheckCircle2, label: "Verified" },
];

/* ══════════════════════════════════════════════════
   LANDING COMPONENT
   ══════════════════════════════════════════════════ */
function Landing() {
  return (
    <div className="landing-scrollbar min-h-screen bg-landing-dark font-inter text-landing-text overflow-x-hidden">
      <InteractiveGrid />
      <FloatingParticles count={40} />
      <CursorGlow />
      <LandingNavbar />

      {/* ────── HERO SECTION ────── */}
      <section className="relative z-10 flex min-h-screen items-center pt-20">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          {/* Left — text */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-xl"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="inline-block rounded-full border border-indigo-500/20 bg-indigo-500/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400"
            >
              The Future of Electronics Commerce
            </motion.p>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
            >
              Build the Future
              <br />
              with{" "}
              <span className="text-gradient">Premium Electronics</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-6 max-w-lg text-base leading-relaxed text-slate-400 sm:text-lg"
            >
              ElectroMart brings together curated hardware, robotics kits, and
              pro-grade components — trusted by makers and engineers worldwide.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <Link
                to="/shop"
                className="btn-shimmer group inline-flex items-center gap-2 rounded-full bg-indigo-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-400 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 no-underline"
              >
                Explore Products
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-slate-300 backdrop-blur transition-all hover:border-white/20 hover:bg-white/[0.06] hover:-translate-y-0.5 no-underline"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="px-4 py-3.5 text-sm font-medium text-slate-500 transition-colors hover:text-white no-underline"
              >
                Login →
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={fadeUp}
              custom={4}
              className="mt-10 flex flex-wrap items-center gap-5"
            >
              {trustBadges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-slate-500">
                  <Icon size={14} className="text-indigo-500/60" />
                  {label}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — Arduino visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <ArduinoVisualization />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.3em] text-slate-600">Scroll</span>
            <div className="h-8 w-[1px] bg-gradient-to-b from-slate-600 to-transparent" />
          </div>
        </motion.div>
      </section>

      {/* ────── STATS BAR ────── */}
      <section className="relative z-10 border-y border-white/5 bg-white/[0.01] backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-6 py-12 sm:justify-between lg:px-8">
          {stats.map(({ value, suffix, label, displayOverride }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-3xl font-bold text-white sm:text-4xl">
                {displayOverride || (
                  <>
                    <AnimatedCounter target={value} />
                    {suffix}
                  </>
                )}
              </div>
              <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ────── FEATURES ────── */}
      <section id="features" className="relative z-10 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
              Everything You Need
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Powerful features for the modern maker
            </h2>
            <p className="mt-4 text-base text-slate-500">
              From AI-powered recommendations to secure payments, we've built every feature
              to make your electronics shopping experience seamless.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ────── HOW IT WORKS ────── */}
      <section id="how-it-works" className="relative z-10 border-t border-white/5 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
              Simple Process
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              How it works
            </h2>
          </motion.div>

          <div className="relative mt-16 grid gap-8 md:grid-cols-3">
            {/* Connecting line */}
            <div className="absolute left-0 right-0 top-16 hidden h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent md:block" />

            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative text-center"
              >
                <div className="relative mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-landing-dark">
                  <step.icon size={24} className="text-indigo-400" />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-slate-500">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ────── CTA SECTION ────── */}
      <section className="relative z-10 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-indigo-500/10 via-landing-dark to-purple-500/5 px-8 py-16 text-center sm:px-16 sm:py-24"
          >
            {/* Ambient glow blobs */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-indigo-500/10 blur-[100px]" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-purple-500/10 blur-[100px]" />

            <div className="relative z-10">
              <Star size={28} className="mx-auto mb-4 text-indigo-400/60" />
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to Build Something Amazing?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-base text-slate-400">
                Join thousands of makers and engineers who trust ElectroMart for
                premium electronics and pro-grade components.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/signup"
                  className="btn-shimmer inline-flex items-center gap-2 rounded-full bg-indigo-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-400 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 no-underline"
                >
                  Get Started Free
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-8 py-3.5 text-sm font-semibold text-slate-300 backdrop-blur transition-all hover:border-white/20 hover:bg-white/[0.06] hover:-translate-y-0.5 no-underline"
                >
                  Explore Catalog
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}

export default Landing;
