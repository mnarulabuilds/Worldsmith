"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ArtisticBackground from "@/components/ArtisticBackground";
import LoadingOverlay from "@/components/LoadingOverlay";

const EXAMPLE_PROMPTS = [
  "A floating crystal kingdom above the clouds",
  "An underwater city with bioluminescent coral",
  "A volcanic landscape with rivers of lava",
  "A frozen tundra under the northern lights",
  "An alien jungle with glowing mushrooms",
  "A cyberpunk cityscape at midnight",
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!prompt.trim() || isLoading) return;

      setIsLoading(true);
      setError("");

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: prompt.trim() }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Generation failed");
        }

        const { world } = await res.json();
        sessionStorage.setItem("worldsmith-world", JSON.stringify(world));
        router.push("/world");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
        setIsLoading(false);
      }
    },
    [prompt, isLoading, router]
  );

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <ArtisticBackground />

      <AnimatePresence>{isLoading && <LoadingOverlay />}</AnimatePresence>

      <div className="relative z-10 w-full max-w-3xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs tracking-widest uppercase text-white/50 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Powered by Imagination
          </motion.div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent animate-gradient-shift">
              WorldSmith
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/40 font-light max-w-xl mx-auto leading-relaxed">
            Describe a world in words, and watch it materialize in three
            dimensions.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative"
        >
          <div className="glass-strong rounded-2xl p-2 transition-all duration-300 focus-within:border-purple-500/30 focus-within:shadow-[0_0_40px_rgba(139,92,246,0.1)]">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setError("");
                }}
                placeholder="Describe your world..."
                disabled={isLoading}
                className="flex-1 bg-transparent px-5 py-4 text-white placeholder-white/25 text-lg outline-none disabled:opacity-50"
                maxLength={500}
                autoFocus
              />
              <button
                type="submit"
                disabled={!prompt.trim() || isLoading}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium tracking-wide transition-all duration-300 hover:from-purple-500 hover:to-cyan-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none whitespace-nowrap"
              >
                Forge World
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3 text-sm text-red-400/80 text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-10"
        >
          <p className="text-xs text-white/20 text-center mb-4 tracking-widest uppercase">
            Try an idea
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLE_PROMPTS.map((example) => (
              <button
                key={example}
                onClick={() => handleExampleClick(example)}
                disabled={isLoading}
                className="px-3.5 py-1.5 rounded-full glass text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all duration-200 disabled:opacity-30"
              >
                {example}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center text-[10px] text-white/15 mt-16 tracking-wider"
        >
          WorldSmith uses AI to interpret your words into 3D scenes
        </motion.p>
      </div>
    </main>
  );
}
