import { Code, BarChart, Briefcase, FileText, Bot } from "lucide-react";
import { ResumeOption } from "./interfaces/Resume";

//* GENERAL
export const FOOTER_LAST_UPDATE = "14 May 2026";

//* CONTACTS
export const EMAIL_ADDRESS = "zshen2002@gmail.com";
export const GITHUB_URL = "https://github.com/bididi-badidi";
export const LINKEDIN_URL = "https://www.linkedin.com/in/zishenchan/";

//* Resume Generation
export const RESUME_OPTIONS: ResumeOption[] = [
  {
    id: "Full Stack Developer",
    label: "Full Stack Developer",
    icon: Code,
    text: "Focus on System Architectures",
    filename: "resume_sw.pdf",
    downloadFilename: "zishenchan_SW.pdf",
  },
  {
    id: "AI Engineering",
    label: "AI Engineering",
    icon: Bot,
    text: "Customized for Agentic Workflows",
    filename: "resume_ai.pdf",
    downloadFilename: "zishenchan_SW.pdf",
  },
  {
    id: "Data Analysis",
    label: "Data Analysis",
    icon: BarChart,
    text: "Customized for Data Science Lifecycle",
    filename: "resume_da.pdf",
    downloadFilename: "zishenchan_DA.pdf",
  },
  {
    id: "General",
    label: "General",
    icon: FileText,
    text: "Technical and Transferable Skills Balanced",
    filename: "resume_ai.pdf",
    downloadFilename: "zishenchan_general.pdf",
  },
  {
    id: "Custom",
    label: "Custom",
    icon: Briefcase,
    text: "Not in the list? Try this",
    filename: "resume_custom.pdf",
    downloadFilename: "zishenchan_custom.pdf",
  },
];

export const MASTER_RESUME_FILENAME = "master_data.json";
export const LLM_KNOWLEDGE_FILENAME = "knowledge.json";
