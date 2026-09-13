export type PresentationGesture = "present" | "point" | "frame";
export type ProjectId = "personal-ai" | "automation-manager" | "hologram" | "fraud-detection" | "dispatcher" | "stock-ai" | "remainder-api" | "shortcuts" | "xcuisite" | "sccc";

export interface ProjectMedia {
  kind: "image" | "video";
  src: string;
  alt: string;
}

export interface ProjectContent {
  id: ProjectId;
  title: string;
  summary: string;
  problem: string;
  approach: string;
  outcome: string;
  technologies: readonly string[];
  landingMedia: ProjectMedia | null;
  detailMedia: readonly ProjectMedia[];
  tourScript: string;
  gesture: PresentationGesture;
  route: string | null;
  demo: { href: string; label: string } | null;
  disclosure: "public" | "generalized" | "awaiting-evidence";
  evidenceNote: string;
  featuredOrder: number | null;
  archived: boolean;
}

// Keep claims conservative: the registry is also the concierge's factual context.
export const projects: readonly ProjectContent[] = [
  {
    id: "personal-ai", title: "Updated Personal AI",
    summary: "A conversation that connects answers to useful actions.",
    problem: "A portfolio can describe work, but visitors still need help finding what matters to them.",
    approach: "Connect Gemini, portfolio knowledge, validated function calls, and a conversational interface.",
    outcome: "Visitors can ask about the work, navigate projects, and access portfolio actions through conversation.",
    technologies: ["Gemini", "Next.js", "TypeScript", "AWS S3"],
    landingMedia: { kind: "image", src: "/image/preview-personal-ai.png", alt: "Existing Personal AI portfolio interface" },
    detailMedia: [{ kind: "video", src: "/videos/portfolio/conversation.mp4", alt: "Existing Personal AI conversation demo" }],
    tourScript: "First, Personal AI. This connects portfolio knowledge with conversation and validated actions, helping visitors find relevant work. The existing case study shows the foundation; this new interface is its next iteration.",
    gesture: "present", route: "/projects/personal-ai", demo: null, disclosure: "public",
    evidenceNote: "Existing case study and demos document the earlier version. The new concierge is a prototype.", featuredOrder: 1, archived: false,
  },
  {
    id: "automation-manager", title: "Automation Manager",
    summary: "Making repetitive device testing easier to run and understand.",
    problem: "Android device testing involves repetitive operations and results that need interpretation.",
    approach: "An internship web platform for automating device tests and reviewing results.",
    outcome: "A unified interface for device testing and result analysis. No performance metrics are published.",
    technologies: ["Test automation", "Web platforms", "Result analysis"], landingMedia: null, detailMedia: [],
    tourScript: "Automation Manager grew out of internship work on Android device testing and result analysis. This is a generalized account of the workflow. Employer screenshots, internal data, and proprietary implementation details are intentionally excluded.",
    gesture: "frame", route: "/projects/automation-manager", demo: null, disclosure: "generalized",
    evidenceNote: "Disclosure-safe overview of internship work. No proprietary media or measured impact claims.", featuredOrder: 2, archived: false,
  },
  {
    id: "hologram", title: "Hologram",
    summary: "Giving a conversational interface a physical presence.",
    problem: "Visitors need an approachable way to ask questions at a reception point.",
    approach: "An interactive hologram AI receptionist developed during an AV Media internship.",
    outcome: "A receptionist experience that answers visitor questions.",
    technologies: ["Conversational AI", "Interactive interfaces"], landingMedia: null, detailMedia: [],
    tourScript: "Hologram explores how an AI receptionist can answer visitor questions through an interactive presence. It is earlier internship work, separate from the new blue portfolio presenter you are seeing here.",
    gesture: "present", route: null, demo: null, disclosure: "generalized",
    evidenceNote: "Based on the existing portfolio description. Additional public evidence has not been cleared for this preview.", featuredOrder: 3, archived: false,
  },
  {
    id: "fraud-detection", title: "Credit Card Fraud Detection ML",
    summary: "Exploring machine learning for transaction fraud detection.",
    problem: "Identifying fraudulent credit card transactions is a classification problem.",
    approach: "Project selected for this portfolio; implementation details are awaiting an authored case study.",
    outcome: "Evaluation results and measured outcomes are not yet published.",
    technologies: ["Machine learning", "Classification"], landingMedia: null, detailMedia: [],
    tourScript: "This project focuses on credit card fraud detection with machine learning. The detailed methodology and evaluation evidence are still being prepared, so I will not claim an accuracy score or production deployment.",
    gesture: "point", route: null, demo: null, disclosure: "awaiting-evidence",
    evidenceNote: "Case study in preparation. Dataset, model, evaluation, and results require author verification.", featuredOrder: 4, archived: false,
  },
  {
    id: "dispatcher", title: "Dispatcher",
    summary: "Coordinating agents through a pull-request cycle.",
    problem: "Multi-agent development needs coordination across the pull-request lifecycle.",
    approach: "A multi-agent PR-cycle project selected for the featured portfolio.",
    outcome: "Architecture, implementation evidence, and results are awaiting an authored case study.",
    technologies: ["Multi-agent systems", "Developer workflows"], landingMedia: null, detailMedia: [],
    tourScript: "Finally, Dispatcher: a multi-agent pull-request cycle. It represents the harness-engineering side of this portfolio. The full architecture and results are not published yet; contact Zi Shen to discuss the work.",
    gesture: "frame", route: null, demo: null, disclosure: "awaiting-evidence",
    evidenceNote: "Case study in preparation. No unsupported claims about autonomy or delivery speed.", featuredOrder: 5, archived: false,
  },
  ...([
    ["stock-ai", "Stock AI", "AI-assisted stock research.", "/projects/stock-ai"],
    ["remainder-api", "Reminder API", "A reminder API and interactive playground.", "/projects/remainder-api"],
    ["shortcuts", "Productivity Shortcuts", "A collection of calendar workflows built with Apple Shortcuts.", "/projects/shortcuts"],
    ["xcuisite", "XCuisite", "Earlier project work from the original portfolio.", "/#projects"],
    ["sccc", "SCCC", "Earlier experience from the original portfolio.", "/#experience"],
  ] as const).map(([id, title, summary, route]): ProjectContent => ({
    id, title, summary, route, problem: "See the original portfolio for the project context.",
    approach: "Documented in the original portfolio.", outcome: "See original project evidence.",
    technologies: [], landingMedia: null, detailMedia: [], tourScript: "", gesture: "present",
    demo: id === "remainder-api" ? { href: "/projects/reminders", label: "Open reminders playground" } : null,
    disclosure: "public", evidenceNote: "Retained through the original portfolio.", featuredOrder: null, archived: true,
  })),
];

export const featuredProjects = projects.filter((p) => p.featuredOrder !== null)
  .sort((a, b) => a.featuredOrder! - b.featuredOrder!);
export const archivedProjects = projects.filter((p) => p.archived);
