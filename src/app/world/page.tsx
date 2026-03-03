"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import type { SemanticWorld } from "@/lib/types";

const WorldRenderer = dynamic(() => import("@/components/WorldRenderer"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#050510]">
      <div className="text-white/30 text-sm tracking-widest uppercase">
        Initializing renderer...
      </div>
    </div>
  ),
});

function HUD({ world, onBack }: { world: SemanticWorld; onBack: () => void }) {
  const [showInfo, setShowInfo] = useState(true);

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-start justify-between pointer-events-auto">
        <button
          onClick={onBack}
          className="glass rounded-xl px-4 py-2.5 text-sm text-white/60 hover:text-white/90 hover:bg-white/[0.08] transition-all duration-200 flex items-center gap-2"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          New World
        </button>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="glass rounded-xl px-4 py-2.5 text-sm text-white/60 hover:text-white/90 hover:bg-white/[0.08] transition-all duration-200"
        >
          {showInfo ? "Hide Info" : "Show Info"}
        </button>
      </div>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute bottom-6 left-6 max-w-sm pointer-events-auto"
          >
            <div className="glass-strong rounded-2xl p-5">
              <h2 className="text-lg font-semibold text-white/90 mb-1">
                {world.name}
              </h2>
              <p className="text-sm text-white/40 leading-relaxed mb-2">
                &ldquo;{world.description}&rdquo;
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[10px] tracking-wider uppercase">
                <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-white/30">
                  {world.biome}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-white/30">
                  {world.atmosphere.timeOfDay}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-white/30">
                  {world.atmosphere.weather}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-white/30">
                  {world.features.length} feature types
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6 right-6"
      >
        <div className="text-[10px] text-white/15 tracking-wider text-right">
          <p>Scroll to zoom</p>
          <p>Click + drag to orbit</p>
          <p>Right-click + drag to pan</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function WorldPage() {
  const [world, setWorld] = useState<SemanticWorld | null>(null);
  const [fadeIn, setFadeIn] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem("worldsmith-world");
    if (!stored) {
      router.push("/");
      return;
    }

    try {
      const parsed = JSON.parse(stored) as SemanticWorld;
      setWorld(parsed);
      setTimeout(() => setFadeIn(false), 1500);
    } catch {
      router.push("/");
    }
  }, [router]);

  const handleBack = () => {
    sessionStorage.removeItem("worldsmith-world");
    router.push("/");
  };

  if (!world) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#050510]">
        <div className="text-white/30 text-sm tracking-widest uppercase">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#050510]">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white/30">Preparing world...</div>
          </div>
        }
      >
        <WorldRenderer world={world} />
      </Suspense>

      <HUD world={world} onBack={handleBack} />

      <AnimatePresence>
        {fadeIn && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            onAnimationComplete={() => setFadeIn(false)}
            className="absolute inset-0 bg-[#050510] z-20 pointer-events-none"
          />
        )}
      </AnimatePresence>
    </main>
  );
}
