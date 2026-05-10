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
        "relative isolate overflow-visible rounded-full border-0 bg-transparent p-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
      whileTap={TRIGGER_TAP}
      onClick={() => {
        setChatOpen(true);
        setTimeout(() => onOpen(), 100);
      }}
    >
      <GlassSurface
        width="auto"
        height={62}
        borderRadius={9999}
        displace={0.5}
        distortionScale={-180}
        redOffset={0}
        greenOffset={10}
        blueOffset={20}
        brightness={50}
        opacity={0.93}
        mixBlendMode="screen"
        className="glass-surface--pill cursor-pointer"
      >
        <span className="relative z-10 px-8 text-sm font-medium whitespace-nowrap text-bright">
          {children}
        </span>
      </GlassSurface>
    </motion.button>
  );
};
