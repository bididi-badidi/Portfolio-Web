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
        backdropFilter: "blur(14px) saturate(1.25)",
      }}
      exit={{
        opacity: 0,
        backdropFilter: "blur(0px) saturate(1.25)",
        transition: { delay: 1 },
      }}
      className={cn("fixed inset-0 z-50 h-full w-full bg-[rgb(2_6_23_/_0.58)]", className)}
    ></motion.div>
  );
};
