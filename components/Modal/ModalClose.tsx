import { useUIState } from "@/app/context/UIStateContext";
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
          className="absolute top-4 right-4 group cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-bright h-4 w-4 group-hover:scale-125 group-hover:rotate-3 transition duration-200"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M18 6l-12 12" />
            <path d="M6 6l12 12" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
};
