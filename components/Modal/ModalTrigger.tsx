import { useUIState } from "@/app/context/UIStateContext";
import { cn } from "@/app/utils/cn";
import GlassSurface from "@/components/GlassSurface";
import type { ReactNode } from "react";
import { motion } from "motion/react";

const TRIGGER_TAP = { scale: 0.98 };

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
        "relative isolate overflow-visible rounded-[14px] border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      whileTap={TRIGGER_TAP}
      onClick={() => {
        setChatOpen(true);
        setTimeout(() => onOpen(), 100);
      }}
    >
      <GlassSurface
        width={46}
        height={46}
        borderRadius={14}
        displace={0.5}
        distortionScale={-180}
        redOffset={0}
        greenOffset={10}
        blueOffset={20}
        brightness={50}
        opacity={0.93}
        mixBlendMode="screen"
        className="glass-surface--icon-btn cursor-pointer"
      >
        <span className="relative z-10 flex items-center justify-center text-bright">
          {children}
        </span>
      </GlassSurface>
    </motion.button>
  );
};
