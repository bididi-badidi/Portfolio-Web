import { useUIState } from "@/app/context/UIStateContext";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const iconVariants = {
  hidden: { y: -10, opacity: 0, duration: 0.5 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      delay: 1.1,
      duration: 0.5,
      type: "spring",
    },
  },
};

export const ModalClose = () => {
  const { isChatOpen, setChatOpen, allowAnimation } = useUIState();
  return (
    <AnimatePresence>
      {isChatOpen && (
        <motion.button
          variants={allowAnimation ? iconVariants : undefined}
          initial="hidden"
          animate={isChatOpen ? "visible" : "hidden"}
          exit="hidden"
          onClick={() => setChatOpen(false)}
          aria-label="Close chat"
          className="group absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-[14px] border-0 bg-transparent p-0 cursor-pointer text-bright focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <X
            aria-hidden="true"
            className="h-5 w-5 transition duration-200 group-hover:scale-110 group-hover:text-foreground"
            strokeWidth={1.9}
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
