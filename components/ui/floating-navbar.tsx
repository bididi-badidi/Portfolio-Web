"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
  type SpringOptions,
} from "motion/react";
import {
  BookOpen,
  Bot,
  BriefcaseBusiness,
  Code2,
  Eye,
  FolderKanban,
  GitBranch,
  Home,
  Layers,
  Lightbulb,
  Mail,
  ScrollText,
  Sparkles,
  Telescope,
  UserRound,
  Video,
  type LucideIcon,
} from "lucide-react";
import { useUIState } from "@/app/context/UIStateContext";
import { themeClasses } from "@/app/styles/themeClasses";
import { cn } from "@/app/utils/cn";
import GlassSurface from "@/components/GlassSurface";

export interface navItemInterface {
  name: string;
  link: string;
}

type DockNavItem = navItemInterface & {
  icon: LucideIcon;
  onClick?: () => void;
};

type DockItemProps = {
  children: React.ReactNode;
  className?: string;
  href?: string;
  label: string;
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  distance: number;
  magnification: number;
  baseItemSize: number;
  onClick?: () => void;
  onHoverChange: (label: string | null) => void;
};

const iconByName: Record<string, LucideIcon> = {
  // Main nav
  home: Home,
  about: UserRound,
  experience: BriefcaseBusiness,
  project: FolderKanban,
  projects: FolderKanban,
  contact: Mail,
  "tech stack": Code2,
  // Project subpage sections
  introduction: BookOpen,
  idea: Lightbulb,
  resume: ScrollText,
  why: Lightbulb,
  tech: Code2,
  features: Sparkles,
  workflows: GitBranch,
  beyond: Telescope,
  video: Video,
  implementations: Layers,
  compare: Eye,
};

const getNavIcon = (name: string) => iconByName[name.toLowerCase()] ?? FolderKanban;

function DockIcon({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex h-full w-full items-center justify-center", className)}>{children}</div>;
}

function DockItem({
  children,
  className,
  href,
  label,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
  onClick,
  onHoverChange,
}: DockItemProps) {
  const ref = useRef<HTMLElement | null>(null);

  const mouseDistance = useTransform(mouseX, (value) => {
    const rect = ref.current?.getBoundingClientRect() ?? { x: 0, width: baseItemSize };
    return value - rect.x - rect.width / 2;
  });

  const targetSize = useTransform(mouseDistance, [-distance, 0, distance], [baseItemSize, magnification, baseItemSize]);
  const size = useSpring(targetSize, spring);

  const itemClassName = cn(
    themeClasses.control.focusRing,
    "relative flex aspect-square shrink-0 items-center justify-center overflow-visible rounded-2xl text-bright",
    className,
  );

  const sharedProps = {
    style: { width: size, height: size },
    onMouseEnter: () => onHoverChange(label),
    onMouseLeave: () => onHoverChange(null),
  };

  if (href) {
    return (
      <motion.a
        ref={(node) => { ref.current = node; }}
        href={href}
        aria-label={label}
        className={itemClassName}
        {...sharedProps}
      >
        {children}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={(node) => { ref.current = node; }}
      type="button"
      aria-label={label}
      className={itemClassName}
      onClick={onClick}
      {...sharedProps}
    >
      {children}
    </motion.button>
  );
}

export const FloatingNav = ({
  navItems,
  className,
  showHome = true,
  showInitiateAI = false,
}: {
  navItems: navItemInterface[];
  className?: string;
  showHome?: boolean;
  showInitiateAI?: boolean;
}) => {
  const { setChatOpen } = useUIState();
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  const spring = useMemo(() => ({ mass: 0.1, stiffness: 150, damping: 12 }), []);
  const magnification = 64;
  const distance = 160;
  const panelHeight = 62;
  const dockHeight = 116;
  const baseItemSize = 46;

  const maxHeight = useMemo(
    () => Math.max(dockHeight, magnification + magnification / 2 + 4),
    [dockHeight, magnification],
  );
  const rowHeight = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(rowHeight, spring);

  const items = useMemo<DockNavItem[]>(() => {
    const mappedItems = navItems.map((item) => ({
      ...item,
      icon: getNavIcon(item.name),
    }));

    if (!showHome) return mappedItems;
    return [{ name: "Home", link: "/", icon: Home }, ...mappedItems];
  }, [navItems, showHome]);

  return (
    <motion.nav
      style={{ height, scrollbarWidth: "none" }}
      className="fixed inset-x-0 bottom-4 z-30 mx-auto flex max-w-full items-end justify-center px-4 sm:bottom-6 pointer-events-none"
      aria-label="Primary navigation"
    >
      <div className="relative flex flex-col items-center gap-1.5 pointer-events-auto">
        {/*
         * GlassSurface IS the dock container.
         * width="auto" lets it shrink-wrap to its content.
         * glass-surface--dock overrides the content div's centering/padding.
         * overflow-y is visible so magnified items can pop upward freely.
         */}
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
          className={cn("glass-surface--dock max-w-[calc(100dvw-2rem)]", className)}
        >
          <motion.div
            onMouseMove={({ pageX }) => {
              isHovered.set(1);
              mouseX.set(pageX);
            }}
            onMouseLeave={() => {
              isHovered.set(0);
              mouseX.set(Infinity);
            }}
            className="flex h-full items-end gap-2 px-3 pb-2 sm:gap-3"
            role="toolbar"
            aria-label="Navigation dock"
          >
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <DockItem
                  key={`${item.name}-${item.link}`}
                  href={item.link}
                  label={item.name}
                  mouseX={mouseX}
                  spring={spring}
                  distance={distance}
                  magnification={magnification}
                  baseItemSize={baseItemSize}
                  onHoverChange={setHoveredLabel}
                >
                  <DockIcon>
                    <Icon aria-hidden="true" className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.8} />
                  </DockIcon>
                </DockItem>
              );
            })}
            {showInitiateAI && (
              <>
                <div className="hidden sm:block w-px bg-white/20 self-stretch my-2 shrink-0" />
                <DockItem
                  className="hidden sm:flex"
                  label="Initiate AI"
                  mouseX={mouseX}
                  spring={spring}
                  distance={distance}
                  magnification={magnification}
                  baseItemSize={baseItemSize}
                  onClick={() => setChatOpen(true)}
                  onHoverChange={setHoveredLabel}
                >
                  <DockIcon>
                    <Bot aria-hidden="true" className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.8} />
                  </DockIcon>
                </DockItem>
              </>
            )}
          </motion.div>
        </GlassSurface>

        {/* Centered label below the pill */}
        <div className="h-5 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {hoveredLabel && (
              <motion.span
                key={hoveredLabel}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="text-xs font-medium tracking-wide text-white/60"
              >
                {hoveredLabel}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
};
