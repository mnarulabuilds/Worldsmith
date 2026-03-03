"use client";

import { useEffect, useRef } from "react";

interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  saturation: number;
  lightness: number;
  alpha: number;
  phase: number;
}

export default function ArtisticBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const orbCount = 7;
    const orbs: Orb[] = Array.from({ length: orbCount }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: 150 + Math.random() * 250,
      hue: [260, 280, 200, 320, 240, 180, 300][i % 7],
      saturation: 60 + Math.random() * 30,
      lightness: 20 + Math.random() * 25,
      alpha: 0.15 + Math.random() * 0.15,
      phase: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      time += 0.003;
      ctx.fillStyle = "#050510";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const orb of orbs) {
        orb.x += orb.vx + Math.sin(time + orb.phase) * 0.3;
        orb.y += orb.vy + Math.cos(time * 0.7 + orb.phase) * 0.3;

        if (orb.x < -orb.radius) orb.x = canvas.width + orb.radius;
        if (orb.x > canvas.width + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = canvas.height + orb.radius;
        if (orb.y > canvas.height + orb.radius) orb.y = -orb.radius;

        const pulseFactor = 1 + Math.sin(time * 2 + orb.phase) * 0.15;
        const currentRadius = orb.radius * pulseFactor;

        const gradient = ctx.createRadialGradient(
          orb.x,
          orb.y,
          0,
          orb.x,
          orb.y,
          currentRadius
        );
        gradient.addColorStop(
          0,
          `hsla(${orb.hue + Math.sin(time) * 20}, ${orb.saturation}%, ${orb.lightness + 10}%, ${orb.alpha * 1.2})`
        );
        gradient.addColorStop(
          0.4,
          `hsla(${orb.hue}, ${orb.saturation}%, ${orb.lightness}%, ${orb.alpha * 0.6})`
        );
        gradient.addColorStop(
          1,
          `hsla(${orb.hue}, ${orb.saturation}%, ${orb.lightness}%, 0)`
        );

        ctx.beginPath();
        ctx.arc(orb.x, orb.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Subtle noise overlay
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 16) {
        const noise = (Math.random() - 0.5) * 8;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
      ctx.putImageData(imageData, 0, 0);

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}
