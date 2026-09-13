import type { Metadata } from "next";
import { PersonalAIProject } from "@/components/Portfolio/Projects/PersonalAIProject";

export const metadata: Metadata = {
  title: "Personal AI · Zi Shen Chan",
  description: "A conversational portfolio assistant that connects grounded answers with useful actions. Explore the project, recorded demos, and architecture.",
};

export default function PersonalAIPage() {
  return <PersonalAIProject />;
}
