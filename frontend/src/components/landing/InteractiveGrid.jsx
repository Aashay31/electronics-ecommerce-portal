import { useEffect, useRef } from "react";

export default function InteractiveGrid() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -1000, y: -1000 });
  const raf = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const CELL = 40;
    const RADIUS = 150;
    const isMobile = window.innerWidth < 768;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const handleLeave = () => {
      mouse.current.x = -1000;
      mouse.current.y = -1000;
    };

    if (!isMobile) {
      window.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseleave", handleLeave);
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cols = Math.ceil(canvas.width / CELL) + 1;
      const rows = Math.ceil(canvas.height / CELL) + 1;

      const mx = mouse.current.x;
      const my = mouse.current.y;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * CELL;
          const y = r * CELL;

          if (isMobile) {
            // Static faint grid on mobile
            ctx.strokeStyle = "rgba(99, 102, 241, 0.03)";
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x, y, CELL, CELL);
            continue;
          }

          const cx = x + CELL / 2;
          const cy = y + CELL / 2;
          const dist = Math.sqrt((cx - mx) ** 2 + (cy - my) ** 2);

          if (dist < RADIUS) {
            const intensity = 1 - dist / RADIUS;
            const alpha = intensity * 0.15;
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x, y, CELL, CELL);

            // Corner dots
            if (intensity > 0.3) {
              const dotAlpha = intensity * 0.3;
              ctx.fillStyle = `rgba(99, 102, 241, ${dotAlpha})`;
              const dotR = 1.5 * intensity;
              ctx.beginPath();
              ctx.arc(x, y, dotR, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      raf.current = requestAnimationFrame(draw);
    };

    raf.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
