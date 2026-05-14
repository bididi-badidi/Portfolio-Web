"use client";
import { motion } from "motion/react";

export function FadeUpInView({
  children,
  className,
  initialOpacity = 0.5,
  delay = 0.1,
}: {
  children: React.ReactNode;
  className?: string;
  initialOpacity?: number;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: initialOpacity, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{
        delay: delay,
        duration: 0.5,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
