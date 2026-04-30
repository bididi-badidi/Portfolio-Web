"use client";
import React from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const TimelineMobile = ({ data }: { data: TimelineEntry[] }) => {
  return (
    <div className="w-full relative bg-transparent font-sans md:px-10">
      <div className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div key={index} className="flex justify-start pt-10 md:pt-[10dvh]">
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-black flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-elevated border border-subtle p-2" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-3xl lg:text-5xl font-bold text-neutral-500">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3 className="mb-20 md:hidden block text-2xl text-left font-bold text-neutral-500 dark:text-neutral-500">
                {item.title}
              </h3>
              {item.content}{" "}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
