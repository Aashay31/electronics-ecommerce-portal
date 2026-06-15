import { motion } from "framer-motion";

export default function FeatureCard({ icon: Icon, title, description, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="group relative rounded-2xl glass-card glass-card-hover p-6 transition-all duration-300 cursor-default"
    >
      {/* Glow accent on hover */}
      <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-indigo-500/0 to-purple-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:from-indigo-500/10 group-hover:to-purple-500/5 -z-10" />

      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/10 text-indigo-400 transition-all group-hover:bg-indigo-500/15 group-hover:border-indigo-500/20 group-hover:shadow-lg group-hover:shadow-indigo-500/10">
        {typeof Icon === "string" ? (
          <span className="text-xl">{Icon}</span>
        ) : (
          <Icon size={20} />
        )}
      </div>
      <h3 className="mb-2 text-base font-semibold text-white tracking-tight">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-500">{description}</p>
    </motion.div>
  );
}
