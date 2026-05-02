"use client";

import React from "react";
import { InfiniteMovingCards } from "@/components/ui/InfiniteCard";
import { ScrollableSection } from "@/components/layout/ScrollableSection";
import { motion } from "framer-motion";
import { themeClasses } from "@/app/styles/themeClasses";
import { cn } from "@/app/utils/cn";

export function TechGrid({ id }: { id: string }) {
  return (
    <ScrollableSection id={id} className="mb-[25dvh]">
      <div className="h-[8dvh]" />
      <div className="h-[10rem]">
        <motion.h2
          initial={{ opacity: 0.5, y: 100 }}
          whileInView={{ opacity: 1, y: 50 }}
          transition={{
            delay: 0.1,
            duration: 0.5,
            ease: "easeInOut",
          }}
          className={cn(themeClasses.gradient.heading, "text-center text-4xl font-bold tracking-tight md:text-5xl")}
        >
          Explore My Tech Stack
        </motion.h2>
      </div>
      <div className="h-[128px] lg:h-[256px] rounded-md flex flex-col antialiased items-center justify-center relative overflow-hidden">
        <InfiniteMovingCards
          items={testimonials}
          direction="right"
          speed="slow"
        />
      </div>
      <div className="h-[128px] lg:h-[256px] rounded-md flex flex-col antialiased items-center justify-center relative overflow-hidden">
        <InfiniteMovingCards
          items={testimonials2}
          direction="left"
          speed="slow"
        />
      </div>
    </ScrollableSection>
  );
}
const iconList = [
  "azure",
  "cloud",
  "devops",
  "docker",
  "git",
  "dotnet",
  "grpc",
  "linux",
  "nextjs",
  "postgres",
  "python",
  "react",
  "rest",
  "sass",
  "aws",
];
const testimonials = iconList
  .slice(0, iconList.length / 2)
  .map((name: string) => {
    return {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      url: `/tech/${name}.png`,
      svgName: name,
    };
  });

const testimonials2 = iconList
  .slice(iconList.length / 2)
  .map((name: string) => {
    return {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      url: `/tech/${name}.png`,
      svgName: name,
    };
  });
