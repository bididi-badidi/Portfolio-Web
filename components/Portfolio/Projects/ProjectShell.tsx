import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Navigation } from "../Navigation";
import { ChatLauncher } from "../ChatLauncher";
import { GITHUB_URL, LINKEDIN_URL } from "@/app/config";
import base from "../dark.module.css";
import styles from "./project.module.css";

const defaultLinks = [
  { label: "Overview", id: "about" },
  { label: "Demos", id: "projects" },
  { label: "Architecture", id: "techstack" },
];
const defaultExtraLinks = [{ label: "Try it yourself", id: "contact" }];
const defaultTargets = ["hero", "about", "projects", "techstack", "contact"];

export function ProjectShell({
  children,
  links = defaultLinks,
  extraLinks = defaultExtraLinks,
  targets = defaultTargets,
}: {
  children: ReactNode;
  links?: { label: string; id: string }[];
  extraLinks?: { label: string; id: string }[];
  targets?: string[];
}) {
  return (
    <div className={`${base.page} ${styles.page}`}>
      <Link className={base.skipLink} href="#about">
        Skip to content
      </Link>
      <Navigation
        links={links}
        extraLinks={extraLinks}
        brandHref="/"
        actionHref="/#projects"
        actionLabel="All projects"
      />
      {children}
      <ChatLauncher targets={targets} />
      <footer className={`${base.container} ${base.footer} ${styles.footer}`}>
        <Link href="/#projects">
          <ArrowLeft size={15} aria-hidden="true" /> Back to all projects
        </Link>
        <nav aria-label="Project and social links">
          <Link href={GITHUB_URL} target="_blank" rel="noreferrer">
            GitHub <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
          <Link href={LINKEDIN_URL} target="_blank" rel="noreferrer">
            LinkedIn <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </nav>
      </footer>
    </div>
  );
}
