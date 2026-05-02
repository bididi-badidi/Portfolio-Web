import { useUIState } from "@/app/context/UIStateContext";
import { cn } from "@/app/utils/cn";
import { FluidGlass } from "@/components/ui/FluidGlass";
import type { ReactNode } from "react";
import { motion } from "motion/react";

const TRIGGER_HOVER = { scale: 1.05 };
const TRIGGER_TAP = { scale: 0.95 };

export const ModalTrigger = ({
  children,
  className,
  onOpen,
}: {
  children: ReactNode;
  className?: string;
  onOpen: () => void;
}) => {
  const { setChatOpen } = useUIState();
  return (
    <motion.button
      type="button"
      className={cn(
        "rounded-full border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        className
      )}
      whileHover={TRIGGER_HOVER}
      whileTap={TRIGGER_TAP}
      onClick={() => {
        setChatOpen(true);
        setTimeout(() => onOpen(), 100);
      }}
    >
      <FluidGlass
        borderRadius="9999px"
        containerClassName="w-auto h-auto"
        className="px-8 py-3 w-fit h-fit bg-background/30 backdrop-blur-xl border-white/20 text-bright cursor-pointer hover:bg-white/10 transition-colors flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]"
        intensity={0.6}
      >
        {children}
      </FluidGlass>
    </motion.button>
  );
};
