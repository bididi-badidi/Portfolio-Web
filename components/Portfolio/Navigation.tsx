"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { spring, useMotionPreference } from "./Motion";
import styles from "./dark.module.css";

const defaultLinks = [
  { label: "About", id: "about" },
  { label: "Projects", id: "projects" },
  { label: "Experience", id: "experience" },
];

const defaultExtraLinks = [{ label: "Tech stack", id: "techstack" }, { label: "Let’s talk", id: "contact" }];

export function Navigation({ links = defaultLinks, extraLinks = defaultExtraLinks, brandHref = "#hero", actionHref = "#contact", actionLabel = "Let’s talk" }: {
  links?: { label: string; id: string }[];
  extraLinks?: { label: string; id: string }[];
  brandHref?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  const reduceMotion = useMotionPreference();

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-dark-section]"));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (visible.length) setActive(visible[0].target.id);
    }, { rootMargin: "-15% 0px -55% 0px", threshold: 0 });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const wide = window.matchMedia("(min-width: 701px)");
    const resize = () => { if (wide.matches) setOpen(false); };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    wide.addEventListener("change", resize);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
      wide.removeEventListener("change", resize);
    };
  }, [open]);

  return (
    <header ref={header} className={styles.header}>
      <div className={styles.navbar}>
        <Link href={brandHref} className={styles.brand} aria-label={brandHref === "#hero" ? "Zi Shen Chan, back to top" : "Zi Shen Chan, portfolio home"} onClick={() => setOpen(false)}>
          <span className={styles.monogram} aria-hidden="true">Z</span>
          <span>Zi Shen Chan</span>
        </Link>
        <nav aria-label="Main navigation" className={styles.desktopNav} onMouseLeave={() => setHovered(null)}>
          {links.map((link) => (
            <motion.a
              key={link.id} href={`#${link.id}`}
              aria-current={active === link.id ? "location" : undefined}
              onMouseEnter={() => setHovered(link.id)}
              onFocus={() => setHovered(link.id)}
              onBlur={() => setHovered(null)}
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
              transition={spring}
            >
              {(hovered ?? active) === link.id && <motion.span aria-hidden="true" className={styles.navHighlight} layoutId="dark-nav-highlight" transition={reduceMotion ? { duration: 0.12 } : spring} />}
              <span>{link.label}</span>
            </motion.a>
          ))}
        </nav>
        <Link href={actionHref} className={`${styles.button} ${styles.navContact}`}>{actionLabel} <ArrowUpRight aria-hidden="true" size={16} /></Link>
        <motion.button
          ref={toggle}
          className={styles.menuToggle}
          type="button"
          tabIndex={0}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="dark-mobile-nav"
          whileTap={reduceMotion ? undefined : { scale: 0.94 }}
          transition={spring}
          onClick={() => setOpen(!open)}
        >
          {open ? <X aria-hidden="true" size={21} /> : <Menu aria-hidden="true" size={21} />}
        </motion.button>
      </div>
      <motion.nav
        id="dark-mobile-nav"
        aria-label="Mobile navigation"
        aria-hidden={!open}
        inert={!open}
        className={styles.mobileNav}
        initial={false}
        animate={{ opacity: open ? 1 : 0, scale: reduceMotion ? 1 : open ? 1 : 0.97, y: reduceMotion ? 0 : open ? 0 : -8 }}
        transition={reduceMotion ? { duration: 0.12 } : spring}
        style={{ pointerEvents: open ? "auto" : "none" }}
      >
        {[...links, ...extraLinks].map((link, index) => (
          <motion.a
            key={link.id} href={`#${link.id}`} onClick={() => setOpen(false)}
            initial={false}
            animate={{ opacity: open ? 1 : 0, y: reduceMotion ? 0 : open ? 0 : -8 }}
            transition={reduceMotion ? { duration: 0.1 } : { ...spring, delay: open ? index * 0.025 : 0 }}
            whileTap={reduceMotion ? undefined : { x: 3 }}
          >{link.label}<ArrowUpRight size={18} aria-hidden="true" /></motion.a>
        ))}
      </motion.nav>
    </header>
  );
}
