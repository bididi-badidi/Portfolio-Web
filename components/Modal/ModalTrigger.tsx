import { useUIState } from "@/app/context/UIStateContext";
import { themeClasses } from "@/app/styles/themeClasses";
import { cn } from "@/app/utils/cn";
import { AnimatedBlobs } from "@/components/ui/AnimatedBlobs";
import { FluidGlass } from "@/components/ui/FluidGlass";
import type { ReactNode } from "react";
import { motion } from "motion/react";

const TRIGGER_TAP = { scale: 0.98 };
const MODAL_GLASS_TINT = "var(--color-bg-glass)";

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
        "group relative isolate overflow-visible rounded-full border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      whileTap={TRIGGER_TAP}
      onClick={() => {
        setChatOpen(true);
        setTimeout(() => onOpen(), 100);
      }}
    >
      <FluidGlass
        borderRadius="9999px"
        containerClassName="relative z-10 w-auto h-auto"
        tintColor={MODAL_GLASS_TINT}
        className={cn(
          themeClasses.surface.glass,
          themeClasses.text.primary,
          "px-8 py-3 w-fit h-fit cursor-pointer transition-colors flex items-center justify-center shadow-[0_0_20px_var(--color-bg-glass)] hover:shadow-[0_0_25px_var(--color-bg-glass-hover)]",
        )}
        intensity={0.6}
      >
        <div className="absolute inset-0 z-0 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100">
          <AnimatedBlobs variant="trigger" />
        </div>
        <span className="relative z-10">{children}</span>
      </FluidGlass>
    </motion.button>
  );
};
