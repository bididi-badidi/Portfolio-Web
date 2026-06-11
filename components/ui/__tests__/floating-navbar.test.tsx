import { afterEach, describe, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";

const setChatOpen = mock();

mock.module("@/app/context/UIStateContext", () => ({
  useUIState: () => ({
    setChatOpen,
  }),
}));

mock.module("motion/react", () => {
  const React = require("react");

  const makeMotionEl =
    (tag: string) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({
      children,
      style,
      className,
      onClick,
      onMouseEnter,
      onMouseLeave,
      onMouseMove,
      role,
      "aria-label": ariaLabel,
      href,
      whileTap: _whileTap,
      variants: _variants,
      initial: _initial,
      animate: _animate,
      exit: _exit,
      transition: _transition,
      ...rest
    }: any) =>
      React.createElement(
        tag,
        {
          ...rest,
          style,
          className,
          onClick,
          onMouseEnter,
          onMouseLeave,
          onMouseMove,
          role,
          "aria-label": ariaLabel,
          href,
        },
        children,
      );

  return {
    motion: {
      nav: makeMotionEl("nav"),
      div: makeMotionEl("div"),
      a: makeMotionEl("a"),
      button: makeMotionEl("button"),
      span: makeMotionEl("span"),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useMotionValue: (initial: number) => ({
      get: () => initial,
      set: () => {},
    }),
    useSpring: (value: unknown) => value,
    useTransform: (_value: unknown, _from: unknown, to: unknown) =>
      Array.isArray(to) ? to[0] : to,
  };
});

import { FloatingNav, type navItemInterface } from "../floating-navbar";

const NAV_ITEMS: navItemInterface[] = [
  { name: "About", link: "#about" },
  { name: "Tech Stack", link: "#tech-stack" },
  { name: "Projects", link: "#projects" },
  { name: "Contact", link: "#contact" },
];

afterEach(() => {
  cleanup();
  setChatOpen.mockReset();
});

describe("FloatingNav", () => {
  it("renders the desktop dock and links", () => {
    render(<FloatingNav navItems={NAV_ITEMS} />);

    expect(screen.getByRole("navigation", { name: /desktop navigation/i })).toBeInTheDocument();
    expect(screen.getByRole("toolbar", { name: /navigation dock/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");

    for (const item of NAV_ITEMS) {
      expect(screen.getByRole("link", { name: item.name })).toHaveAttribute("href", item.link);
    }
  });

  it("can omit the Home link", () => {
    render(<FloatingNav navItems={NAV_ITEMS} showHome={false} />);

    expect(screen.queryByRole("link", { name: "Home" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(NAV_ITEMS.length);
  });

  it("renders and triggers the optional AI dock button", () => {
    render(<FloatingNav navItems={NAV_ITEMS} showInitiateAI />);

    fireEvent.click(screen.getByRole("button", { name: "Initiate AI" }));

    expect(setChatOpen).toHaveBeenCalledWith(true);
  });

  it("toggles the mobile navigation menu", () => {
    render(<FloatingNav navItems={NAV_ITEMS} />);

    const menuButton = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(menuButton);

    const mobileNav = screen.getByRole("navigation", { name: /primary navigation/i });
    expect(mobileNav).toBeInTheDocument();
    expect(within(mobileNav).getByRole("link", { name: "About" })).toHaveAttribute("href", "#about");
  });

  it("renders a GlassSurface wrapper for the dock", () => {
    render(<FloatingNav navItems={NAV_ITEMS} />);

    const glassSurface = document.querySelector(".glass-surface");

    expect(glassSurface).toBeInTheDocument();
    expect(glassSurface?.className).toMatch(/glass-surface--(svg|fallback)/);
  });
});
