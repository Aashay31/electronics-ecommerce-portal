import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Globe, MessageCircle, Users, Mail } from "lucide-react";

const links = {
  Product: [
    { label: "Browse Electronics", to: "/shop" },
    { label: "Arduino Kits", to: "/shop" },
    { label: "IoT Components", to: "/shop" },
    { label: "Robotics", to: "/shop" },
  ],
  Company: [
    { label: "About Us", to: "#" },
    { label: "Careers", to: "#" },
    { label: "Blog", to: "#" },
    { label: "Press", to: "#" },
  ],
  Support: [
    { label: "Help Center", to: "#" },
    { label: "Contact Us", to: "#" },
    { label: "Shipping Info", to: "#" },
    { label: "Returns", to: "#" },
  ],
};

const socialIcons = [
  { Icon: Globe, href: "#" },
  { Icon: MessageCircle, href: "#" },
  { Icon: Users, href: "#" },
  { Icon: Mail, href: "#" },
];

export default function LandingFooter() {
  return (
    <footer className="relative border-t border-white/5 bg-[#060609]">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 no-underline">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <span className="text-sm font-bold text-indigo-400 tracking-wide">EM</span>
              </div>
              <span className="text-lg font-semibold text-white tracking-tight">
                Electro<span className="text-indigo-400">Mart</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              The premium electronics marketplace for makers, engineers, and innovators building the future.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {socialIcons.map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/[0.03] text-slate-500 transition-all hover:border-indigo-500/30 hover:text-indigo-400 hover:bg-indigo-500/5 no-underline"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
                {title}
              </h4>
              <ul className="space-y-3 list-none p-0 m-0">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-sm text-slate-500 transition-colors hover:text-slate-300 no-underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} ElectroMart. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-slate-600 transition hover:text-slate-400 no-underline">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-slate-600 transition hover:text-slate-400 no-underline">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
