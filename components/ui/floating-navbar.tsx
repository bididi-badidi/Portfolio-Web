"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import { themeClasses } from "@/app/styles/themeClasses";
import { cn } from "@/app/utils/cn";

export interface navItemInterface {
  name: string;
  link: string;
}

export const FloatingNav = ({
  navItems,
  className,
  showHome = true,
}: {
  navItems: {
    name: string;
    link: string;
  }[];
  className?: string;
  showHome?: boolean;
}) => {
  const { scrollYProgress } = useScroll();

  const [visible, setVisible] = useState(false);
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    // Check if current is not undefined and is a number
    if (typeof current === "number") {
      const direction = current! - scrollYProgress.getPrevious()!;

      if (scrollYProgress.get() < 0.05) {
        setVisible(false);
      } else {
        if (direction < 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "hidden sm:flex max-w-fit fixed top-10 inset-x-0 mx-auto rounded-full bg-surface/80 border border-glass-border backdrop-blur-lg shadow-input z-[10] px-2 py-2 items-center justify-center space-x-4 lg:space-x-8",
          className,
          hidden ? "sm:hidden" : "",
          showHome ? "" : "pl-8"
        )}
      >
        {showHome && (
          <button className={cn(themeClasses.control.navItem, "border-x text-sm font-medium relative border-glass-border-strong px-4 py-2 rounded-full cursor-pointer")}>
            <Link href="/">Home</Link>
          </button>
        )}
        {navItems.map((navItem: navItemInterface, idx: number) => (
          <a
            key={`link=${idx}`}
            href={navItem.link}
            className={cn(
              themeClasses.control.navItem,
              "relative items-center flex space-x-1 font-bold cursor-pointer"
            )}
          >
            <span className="hidden sm:block text-sm">{navItem.name}</span>
          </a>
        ))}
        <button
          className={cn(themeClasses.control.navItem, "border-y text-sm font-medium relative border-glass-border-strong px-4 py-2 rounded-full cursor-pointer")}
          onClick={() => {
            setVisible(false);
            setTimeout(() => setHidden(true), 1000);
          }}
        >
          <span>Close</span>
          <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-error to-transparent h-px" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
