"use client";
import { useEffect, useRef } from "react";
import { motion, stagger, useAnimate, useInView } from "motion/react";
import { cn } from "@/app/utils/cn";

export const TextGenerateEffect = ({
  words,
  className,
  textContainerClass,
  filter = true,
  duration = 0.5,
  delay = 0,
}: {
  words: string;
  className?: string;
  textContainerClass?: string;
  filter?: boolean;
  duration?: number;
  delay?: number;
}) => {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(" ");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (isInView) {
      setTimeout(
        () =>
          animate(
            "span",
            {
              opacity: 1,
              filter: filter ? "blur(0px)" : "none",
            },
            {
              duration: duration ? duration : 1,
              delay: stagger(0.2),
            }
          ),
        delay * 200
      );
    }
  }, [isInView, animate, filter, duration, delay]);

  const renderWords = () => {
    return (
      <motion.div ref={scope}>
        {wordsArray.map((word, idx) => {
          return (
            <motion.span
              key={word + idx}
              className={`opacity-0 ${
                word.startsWith("<b>")
                  ? "font-normal text-4xl tracking-normal"
                  : ""
              }`}
              style={{
                filter: filter ? "blur(10px)" : "none",
                //
              }}
            >
              {word.replace("<b>", "")}{" "}
            </motion.span>
          );
        })}
      </motion.div>
    );
  };

  return (
    <div ref={ref} className={cn("font-bold", className)}>
      <div className="mt-4">
        <div className={`leading-snug tracking-wide ${textContainerClass}`}>
          {renderWords()}
        </div>
      </div>
    </div>
  );
};
