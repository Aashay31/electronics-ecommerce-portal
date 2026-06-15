import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const glowRef = useRef(null);

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;

    const handleMove = (e) => {
      el.style.setProperty("--gx", `${e.clientX}px`);
      el.style.setProperty("--gy", `${e.clientY}px`);
      el.style.opacity = "1";
    };

    const handleLeave = () => {
      el.style.opacity = "0";
    };

    window.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed inset-0 z-[9999] opacity-0 transition-opacity duration-500"
      style={{
        background:
          "radial-gradient(600px circle at var(--gx, -100px) var(--gy, -100px), rgba(99, 102, 241, 0.06), transparent 40%)",
      }}
    />
  );
}
