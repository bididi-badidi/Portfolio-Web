"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/app/utils/cn";
import { useUIState } from "@/app/context/UIStateContext";

export function PlaceholdersAndVanishInput({
  placeholders,
  onSubmit,
  isSubmitting,
  isFocus,
  setIsFocus,
}: {
  placeholders: string[];
  onSubmit: (textInput: string) => void;
  isSubmitting: boolean;
  isFocus?: boolean;
  setIsFocus?: (focus: boolean) => void;
}) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const { allowAnimation } = useUIState();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startAnimation = () => {
    intervalRef.current = setInterval(() => {
      if (!allowAnimation) return;
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 4000);
  };
  const handleVisibilityChange = () => {
    if (document.visibilityState !== "visible" && intervalRef.current) {
      clearInterval(intervalRef.current); // Clear the interval when the tab is not visible
      intervalRef.current = null;
    } else if (document.visibilityState === "visible") {
      startAnimation(); // Restart the interval when the tab becomes visible
    }
  };

  useEffect(() => {
    startAnimation();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholders]);

  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSubmitting) {
      setValue("");
      onSubmit(inputRef?.current?.value || "");
    }
  };

  const handleFocus = () => {
    if (setIsFocus) setIsFocus(true);
  };

  const handleBlur = () => {
    if (setIsFocus) setIsFocus(false);
  };

  const inputVariants = {
    focused: {
      width: "100%",
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 100,
        mass: 0.8,
      },
    },
    unfocused: {
      width: "50%",
      transition: {
        type: "spring",
        stiffness: 600,
        damping: 30,
        mass: 1.0,
      },
    },
  };

  //* For mouse click submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputRef.current?.value != null && !isSubmitting) {
      setValue("");
      onSubmit(inputRef.current.value);
    }
  };
  return (
    <motion.form
      variants={inputVariants}
      initial="unfocused"
      animate={isFocus ? "focused" : "unfocused"}
      exit="unfocused"
      className={cn(
        "justify-self-end backdrop-blur-md bg-elevated/70 h-12 rounded-full overflow-hidden shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),_0px_1px_0px_0px_rgba(25,28,33,0.02),_0px_0px_0px_1px_rgba(25,28,33,0.08)] transition duration-100",
        value && "bg-elevated/60"
      )}
      onSubmit={handleSubmit}
    >
      <input
        onChange={(e) => {
          setValue(e.target.value);
        }}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        ref={inputRef}
        value={value}
        type="text"
        className={cn(
          "w-full relative text-sm sm:text-base z-50 border-none text-bright bg-transparent h-full rounded-full focus:outline-none focus:ring-0 pl-6 md:pl-10 pr-20"
        )}
      />

      <button
        disabled={!value || isSubmitting}
        // disabled={true}
        type="submit"
        className="absolute right-2 top-1/2 z-50 -translate-y-1/2 h-8 w-8 rounded-full bg-elevated disabled:bg-transparent  transition duration-200 flex items-center justify-center"
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-bright h-4 w-4"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <motion.path
            d="M5 12l14 0"
            initial={{
              strokeDasharray: "50%",
              strokeDashoffset: "50%",
            }}
            animate={{
              strokeDashoffset: value && !isSubmitting ? 0 : "50%",
            }}
            transition={{
              duration: 0.3,
              ease: "linear",
            }}
          />
          <path d="M13 18l6 -6" />
          <path d="M13 6l6 6" />
        </motion.svg>
      </button>

      <div className="absolute inset-0 flex items-center rounded-full pointer-events-none">
        <AnimatePresence mode="wait">
          {!isFocus && (
            <motion.p
              initial={{
                y: 5,
                opacity: 0,
              }}
              key={`current-placeholder-${currentPlaceholder}`}
              animate={{
                y: 0,
                opacity: 1,
              }}
              exit={{
                y: -15,
                opacity: 0,
              }}
              transition={{
                duration: 0.3,
                ease: "linear",
              }}
              className="dark:text-zinc-500 text-sm sm:text-base font-normal text-neutral-500 pl-6 md:pl-10 text-left w-[calc(100%-2rem)] truncate"
            >
              {placeholders[currentPlaceholder]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.form>
  );
}
