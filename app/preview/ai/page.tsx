import type { Metadata } from "next";
import { ModelIntroduction } from "@/components/ModelIntroduction/ModelIntroduction";

export const metadata: Metadata = {
  title: "AI introduction · Zi Shen Chan",
  description: "An introduction to a new sapphire AI presence.",
};

export default function AIIntroductionPage() {
  return <ModelIntroduction />;
}
