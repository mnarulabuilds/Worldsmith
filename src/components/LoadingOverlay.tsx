"use client";

import { motion } from "framer-motion";

export default function LoadingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050510]/90 backdrop-blur-xl"
    >
      <div className="relative mb-8">
        <motion.div
          className="w-20 h-20 rounded-full border-2 border-purple-500/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 w-20 h-20 rounded-full border-t-2 border-r-2 border-cyan-400"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 w-16 h-16 rounded-full border-b-2 border-l-2 border-purple-400/60"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-3 h-3 rounded-full bg-cyan-400"
            animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </div>

      <motion.p
        className="text-lg font-light tracking-widest text-white/70 uppercase"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Forging your world
      </motion.p>

      <motion.div
        className="mt-4 flex gap-1.5"
        initial="hidden"
        animate="visible"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-purple-400/60"
            animate={{ y: [0, -8, 0], opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
