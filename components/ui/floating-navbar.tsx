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
  Menu,
  ScrollText,
  Sparkles,
  Telescope,
  UserRound,
  Video,
  X,
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

// Shared GlassSurface props for the 46×46 icon buttons (hamburger + fan items)
const ICON_BTN_GLASS: React.ComponentProps<typeof GlassSurface> = {
  width: 46,
  height: 46,
  borderRadius: 14,
  displace: 0.5,
  distortionScale: -180,
  redOffset: 0,
  greenOffset: 10,
  blueOffset: 20,
  brightness: 50,
  opacity: 0.93,
  mixBlendMode: "screen",
  className: "glass-surface--icon-btn",
};

// Fan-up animation variants — defined outside component to avoid recreation
const fanContainerVariants = {
  open: {
    transition: { staggerChildren: 0.06, staggerDirection: -1 as const },
  },
  closed: {
    transition: { staggerChildren: 0.04, staggerDirection: 1 as const },
  },
};

const fanItemVariants = {
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 260, damping: 22 },
  },
  closed: {
    opacity: 0,
    y: 16,
    scale: 0.88,
    transition: { duration: 0.18, ease: "easeIn" as const },
  },
};

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
    "relative flex aspect-square shrink-0 items-center justify-center overflow-visible rounded-[14px] text-bright",
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
    <>
      {/* ── Desktop dock — hidden on mobile ── */}
      <motion.nav
        style={{ height, scrollbarWidth: "none" }}
        className="fixed inset-x-0 bottom-4 z-30 mx-auto hidden max-w-full items-end justify-center px-4 sm:bottom-6 sm:flex pointer-events-none"
        aria-label="Desktop navigation"
      >
        <div className="relative flex flex-col items-center gap-1.5 pointer-events-auto">
          <GlassSurface
            width="auto"
            height={62}
            borderRadius={14}
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

          {/* Hover label strip */}
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

      {/* ── Mobile: hamburger trigger ── */}
      <motion.button
        type="button"
        className="fixed bottom-[42px] left-4 z-30 flex items-center justify-center sm:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        aria-expanded={isMobileOpen}
        aria-controls="mobile-nav-menu"
        aria-label={isMobileOpen ? "Close menu" : "Open menu"}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsMobileOpen((v) => !v)}
      >
        <GlassSurface {...ICON_BTN_GLASS}>
          <AnimatePresence mode="wait" initial={false}>
            {isMobileOpen ? (
              <motion.span
                key="x"
                className="flex items-center justify-center text-bright"
                initial={{ rotate: -45, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 45, opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.18 }}
              >
                <X aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
              </motion.span>
            ) : (
              <motion.span
                key="menu"
                className="flex items-center justify-center text-bright"
                initial={{ rotate: 45, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -45, opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.18 }}
              >
                <Menu aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
              </motion.span>
            )}
          </AnimatePresence>
        </GlassSurface>
      </motion.button>

      {/* ── Mobile: fan-up menu ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Invisible backdrop — tap outside to dismiss */}
            <div
              className="fixed inset-0 z-[28] sm:hidden"
              aria-hidden="true"
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Fan items stack upward above the hamburger.
                bottom-[100px] = 42px (pill offset) + 46px (hamburger height) + 12px (gap) */}
            <motion.nav
              id="mobile-nav-menu"
              aria-label="Primary navigation"
              className="fixed bottom-[100px] left-4 z-[29] flex flex-col items-start gap-3 sm:hidden"
              variants={fanContainerVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.name}
                    variants={fanItemVariants}
                    className="flex items-center gap-3"
                  >
                    <GlassSurface {...ICON_BTN_GLASS}>
                      <a
                        href={item.link}
                        aria-label={item.name}
                        onClick={() => setIsMobileOpen(false)}
                        className="flex h-full w-full items-center justify-center text-bright focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                      >
                        <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.8} />
                      </a>
                    </GlassSurface>
                    <span className="text-sm font-medium text-white/70 whitespace-nowrap">
                      {item.name}
                    </span>
                  </motion.div>
                );
              })}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
