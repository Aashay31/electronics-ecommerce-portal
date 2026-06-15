/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        landing: {
          dark: "#0a0a0f",
          darker: "#060609",
          card: "rgba(255, 255, 255, 0.03)",
          border: "rgba(255, 255, 255, 0.06)",
          accent: "#6366f1",
          "accent-dim": "rgba(99, 102, 241, 0.15)",
          glow: "rgba(99, 102, 241, 0.4)",
          text: "#e2e8f0",
          muted: "#64748b",
        },
      },
      fontFamily: {
        inter: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
        "float-slow": "float 8s ease-in-out infinite",
        "spin-slow": "spin 20s linear infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "orbit": "orbit 12s linear infinite",
        "orbit-reverse": "orbit 15s linear infinite reverse",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.4", filter: "blur(20px)" },
          "50%": { opacity: "0.8", filter: "blur(30px)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        orbit: {
          from: { transform: "rotate(0deg) translateX(140px) rotate(0deg)" },
          to: { transform: "rotate(360deg) translateX(140px) rotate(-360deg)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
