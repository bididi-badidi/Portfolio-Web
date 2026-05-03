import { motion } from "motion/react";
import { cn } from "@/app/utils/cn";

export const Overlay = ({ className }: { className?: string }) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
        backdropFilter: "blur(10px)",
      }}
      exit={{
        opacity: 0,
        backdropFilter: "blur(0px)",
        transition: { delay: 1 },
      }}
      className={cn("fixed inset-0 h-full w-full bg-overlay z-50", className)}
    ></motion.div>
  );
};
