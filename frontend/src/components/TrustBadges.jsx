import { Truck, ShieldCheck, BadgeCheck, Headphones } from "lucide-react";

const BADGES = [
  {
    icon: Truck,
    title: "Express Delivery",
    subtitle: "Ships within 24 hours",
  },
  {
    icon: ShieldCheck,
    title: "100% Secure Payments",
    subtitle: "Razorpay encrypted checkout",
  },
  {
    icon: BadgeCheck,
    title: "Genuine Components",
    subtitle: "Sourced from verified suppliers",
  },
  {
    icon: Headphones,
    title: "Dedicated Support",
    subtitle: "Available Mon\u2013Sat, 10am\u20136pm",
  },
];

function TrustBadges() {
  return (
    <section className="border-y border-slate-200 bg-slate-50 px-4 py-8 dark:border-y dark:border-white/5 dark:bg-slate-900/50">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 md:grid-cols-4 md:gap-0">
        {BADGES.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <div
              key={badge.title}
              className={`flex flex-col items-center gap-2 ${
                index > 0
                  ? "md:border-l md:border-slate-200 md:dark:border-white/10"
                  : ""
              }`}
            >
              <Icon className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              <span className="text-center text-sm font-semibold text-slate-800 dark:text-white">
                {badge.title}
              </span>
              <span className="text-center text-xs text-slate-500 dark:text-slate-400">
                {badge.subtitle}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default TrustBadges;
