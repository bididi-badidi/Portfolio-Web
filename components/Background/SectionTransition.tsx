"use client";

import { motion } from "framer-motion";

export function SectionTransition() {
  return (
    <div className="h-[10rem] bg-gradient-to-b from-background to-transparent">
      <motion.h2
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 50 }}
        transition={{
          delay: 0.1,
          duration: 0.5,
          ease: "easeInOut",
        }}
        className="bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-5xl"
      >
        Explore My Tech Stack
      </motion.h2>
    </div>
  );
}
