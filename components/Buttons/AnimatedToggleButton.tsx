"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

export const AnimatedToggleButton = ({
  text,
  isOn,
  setIsOn,
  ambient = false,
  firstTimeDelay = 1000,
  ambientDuration = 4000,
}: {
  text: string;
  isOn: boolean;
  setIsOn: (open: boolean) => void;
  ambient?: boolean;
  firstTimeDelay?: number;
  ambientDuration?: number;
}) => {
  const [showAmbient, setShowAmbient] = useState(false);

  useEffect(() => {
    if (ambient) {
      const startTimer = setTimeout(() => {
        setShowAmbient(true);
        setIsOn(true);
      }, firstTimeDelay);

      // Stop ambient effect after duration
      const stopTimer = setTimeout(() => {
        setShowAmbient(false);
      }, firstTimeDelay + ambientDuration);

      return () => {
        clearTimeout(startTimer);
        clearTimeout(stopTimer);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ambient]);

  const toggleSwitch = () => setIsOn(!isOn);

  const getButtonVariant = () => {
    if (showAmbient) return "ambient";
    return isOn ? "on" : "off";
  };

  return (
    <div className="flex flex-col items-center justify-center ">
      <motion.button
        className={`w-[40px] h-[20px] rounded-[25px] flex p-[2px] cursor-pointer`}
        style={{
          justifyContent: "flex-" + (isOn ? "end" : "start"),
        }}
        onClick={toggleSwitch}
        variants={buttonVariants}
        animate={getButtonVariant()}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-[16px] h-full bg-white/80 rounded-[25px]"
          layout
          transition={{
            type: "spring",
            visualDuration: ambient ? 0.6 : 0.3,
            bounce: 0.2,
          }}
          variants={toggleVariants}
          animate={isOn ? "on" : "off"}
        />
      </motion.button>
      <p className="text-xs text-bright">{text}</p>
    </div>
  );
};

const buttonVariants = {
  off: {
    backgroundColor: "#e2e8f0",
    boxShadow: "0 0 0px transparent",
    transition: {
      backgroundColor: { duration: 0.5 },
      boxShadow: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  },
  on: {
    backgroundColor: "#1f2937",
    boxShadow: "0 0 0px transparent",
    transition: {
      backgroundColor: { duration: 0.5 },
      boxShadow: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  },
  ambient: {
    backgroundColor: "#1f2937",
    boxShadow: [
      "0 0 8px #e2e8f0",
      "0 0 16px #e2e8f0",
      "0 0 8px #e2e8f0",
      "0 0 1px #e2e8f0",
      "0 0 0px transparent",
    ],
    transition: {
      backgroundColor: { duration: 0.5 },
      boxShadow: {
        duration: 4,
        ease: "easeInOut",
        times: [0, 0.5, 0.75, 0.95, 1],
      },
    },
  },
};

const toggleVariants = {
  off: {
    backgroundColor: "#1f2937",
  },
  on: {
    backgroundColor: "#e2e8f0",
  },
};
