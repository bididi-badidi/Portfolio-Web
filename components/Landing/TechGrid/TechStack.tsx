"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { themeClasses } from "@/app/styles/themeClasses";
import { cn } from "@/app/utils/cn";
import { ScrollableSection } from "@/components/layout/ScrollableSection";
import { SoftAuroraBackground } from "@/components/Landing/Hero/SoftAuroraBackground";
import { FadeUpInView } from "@/components/ui/FadeUpInView";

type TechNode = {
  name: string;
  icon: string;
  note: string;
};

type TechLayer = {
  label: string;
  eyebrow: string;
  description: string;
  accent: string;
  className: string;
  tools: TechNode[];
};

const techLayers: TechLayer[] = [
  {
    label: "AI Layer",
    eyebrow: "reasoning + retrieval",
    description: "Models and automation hooks that turn static interfaces into useful assistants.",
    accent: "34 211 238",
    className: "lg:col-start-2 lg:col-span-4",
    tools: [
      { name: "Gemini", icon: "gemini", note: "LLM workflows" },
      { name: "txtai", icon: "txtai", note: "semantic search" },
      { name: "Telegram", icon: "telegram", note: "chat actions" },
      { name: "Shortcuts", icon: "shortcuts", note: "personal automation" },
    ],
  },
  {
    label: "Interface Layer",
    eyebrow: "web experience",
    description: "The visual layer: responsive UI, interaction polish, and project storytelling.",
    accent: "129 140 248",
    className: "lg:col-start-7 lg:col-span-4 lg:translate-y-12",
    tools: [
      { name: "Next.js", icon: "nextjs", note: "app router" },
      { name: "React", icon: "react", note: "stateful UI" },
      { name: "Sass", icon: "sass", note: "styling" },
      { name: "Aceternity", icon: "aceternity", note: "motion UI" },
    ],
  },
  {
    label: "Service Layer",
    eyebrow: "apis + contracts",
    description: "Application logic, typed services, and contracts between products and agents.",
    accent: "52 211 153",
    className: "lg:col-start-1 lg:col-span-4 lg:translate-y-2",
    tools: [
      { name: ".NET", icon: "dotnet", note: "services" },
      { name: ".NET Core", icon: "dotnet-core", note: "runtime" },
      { name: "Python", icon: "python", note: "automation" },
      { name: "REST", icon: "rest", note: "http apis" },
      { name: "gRPC", icon: "grpc", note: "contracts" },
      { name: "JWT", icon: "jwt", note: "auth" },
    ],
  },
  {
    label: "Cloud Layer",
    eyebrow: "ship + operate",
    description: "Infrastructure for deploying, integrating, and keeping services reachable.",
    accent: "96 165 250",
    className: "lg:col-start-5 lg:col-span-4 lg:translate-y-20",
    tools: [
      { name: "Azure", icon: "azure", note: "cloud platform" },
      { name: "Function App", icon: "function-app", note: "serverless" },
      { name: "AWS", icon: "aws", note: "cloud services" },
      { name: "Docker", icon: "docker", note: "containers" },
    ],
  },
  {
    label: "Data Layer",
    eyebrow: "state + foundations",
    description: "Storage, caching, source control, and the operating surface below the app.",
    accent: "251 191 36",
    className: "lg:col-start-9 lg:col-span-4",
    tools: [
      { name: "Postgres", icon: "postgres", note: "relational data" },
      { name: "Redis", icon: "redis", note: "cache" },
      { name: "Git", icon: "git", note: "versioning" },
      { name: "Linux", icon: "linux", note: "runtime" },
      { name: "DevOps", icon: "devops", note: "delivery" },
    ],
  },
];

export function TechGrid({ id }: { id: string }) {
  return (
    <ScrollableSection
      id={id}
      className="relative mb-[24dvh] overflow-hidden px-4 py-24 sm:px-6 lg:px-8 lg:py-32"
    >
      <SoftAuroraBackground className="opacity-45" />
      <div className="absolute inset-0 bg-background/70" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgb(255_255_255_/_0.12)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255_/_0.12)_1px,transparent_1px)] [background-size:72px_72px]"
      />

      <div className="relative mx-auto max-w-7xl">
        <FadeUpInView className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-accent">
            System Map
          </p>
          <h2
            className={cn(
              themeClasses.gradient.heading,
              "mt-4 text-4xl font-bold tracking-tight md:text-5xl"
            )}
          >
            Explore My Tech Stack
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-foreground md:text-lg">
            Tools arranged as the layers I use to build AI-assisted software,
            cloud APIs, and polished web experiences.
          </p>
        </FadeUpInView>

        <div className="relative mt-16 lg:mt-24">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-8 hidden h-[calc(100%-4rem)] w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/20 to-transparent lg:block"
          />
          <div
            aria-hidden="true"
            className="absolute left-[10%] right-[10%] top-1/2 hidden h-px bg-gradient-to-r from-transparent via-white/15 to-transparent lg:block"
          />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12 lg:gap-x-5 lg:gap-y-12">
            {techLayers.map((layer, index) => (
              <FadeUpInView
                key={layer.label}
                delay={index * 0.07}
                className={layer.className}
              >
                <TechCluster layer={layer} />
              </FadeUpInView>
            ))}
          </div>
        </div>
      </div>
    </ScrollableSection>
  );
}

function TechCluster({ layer }: { layer: TechLayer }) {
  return (
    <section
      style={
        {
          "--cluster-accent": layer.accent,
        } as CSSProperties
      }
      className="relative h-full min-h-[21rem] overflow-hidden rounded-lg border border-white/10 bg-black/20 p-5 backdrop-blur-2xl transition-colors duration-300 hover:border-white/20 sm:p-6"
    >
      <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[rgb(var(--cluster-accent)_/_0.7)] to-transparent" />
      <div className="absolute -inset-px bg-[radial-gradient(circle_at_50%_0%,rgb(var(--cluster-accent)_/_0.18),transparent_42%)] opacity-80" />

      <div className="relative flex h-full flex-col">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[rgb(var(--cluster-accent))]">
            {layer.eyebrow}
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-bright">
            {layer.label}
          </h3>
          <p className="mt-3 text-sm leading-6 text-foreground">
            {layer.description}
          </p>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
          {layer.tools.map((tool) => (
            <TechNodeTile key={`${layer.label}-${tool.name}`} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TechNodeTile({ tool }: { tool: TechNode }) {
  return (
    <div className="group/node min-h-28 rounded-md border border-white/10 bg-white/[0.035] p-3 transition-colors duration-300 hover:border-[rgb(var(--cluster-accent)_/_0.6)] hover:bg-white/[0.065]">
      <div className="flex items-start justify-between gap-3">
        <div className="relative h-10 w-10 shrink-0 rounded-md border border-white/10 bg-black/30 p-2 shadow-[0_0_24px_rgb(var(--cluster-accent)_/_0.08)] transition-shadow duration-300 group-hover/node:shadow-[0_0_24px_rgb(var(--cluster-accent)_/_0.22)]">
          <Image
            src={`/tech/${tool.icon}.png`}
            alt=""
            fill
            sizes="40px"
            className="object-contain p-2"
          />
        </div>
        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--cluster-accent))] opacity-70" />
      </div>
      <p className="mt-4 text-sm font-medium leading-tight text-bright">
        {tool.name}
      </p>
      <p className="mt-1 text-xs leading-5 text-muted opacity-80">
        {tool.note}
      </p>
    </div>
  );
}
