"use client";

import { useEffect, useRef } from "react";

const GLYPHS = "$€£¥₦₵0123456789".split("");

export function MatrixCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    let cols = 0;
    let drops: number[] = [];

    const setup = () => {
      const parent = el.parentElement;
      if (!parent) return;
      el.width = parent.clientWidth;
      el.height = parent.clientHeight;
      cols = Math.floor(el.width / 18);
      drops = Array.from({ length: cols }, () => Math.random() * -50);
    };
    setup();

    const onResize = () => setup();
    window.addEventListener("resize", onResize);
    ctx.font = "15px monospace";

    const draw = () => {
      ctx.fillStyle = "oklch(0.19 0.025 264 / 0.15)";
      ctx.fillRect(0, 0, el.width, el.height);
      for (let i = 0; i < cols; i++) {
        const g = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        const isBright = Math.random() > 0.94;
        ctx.fillStyle = isBright ? "oklch(0.88 0.14 276)" : "oklch(0.62 0.15 276 / 0.8)";
        ctx.fillText(g, i * 18, drops[i] * 18);
        if (drops[i] * 18 > el.height && Math.random() > 0.975) drops[i] = 0;
        else drops[i]++;
      }
    };
    const interval = setInterval(draw, 60);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full opacity-65"
    />
  );
}
