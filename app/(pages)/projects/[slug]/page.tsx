import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyProject } from "@/components/Portfolio/Projects/CaseStudyProject";
import {
  darkProjectContent,
  darkProjectIds,
  isDarkProjectId,
} from "@/components/Portfolio/Projects/projectContent";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return darkProjectIds.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isDarkProjectId(slug)) return {};
  const project = darkProjectContent[slug];
  return {
    title: `${project.name} · Zi Shen Chan`,
    description: project.heroDescription,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  if (!isDarkProjectId(slug)) notFound();
  return <CaseStudyProject projectId={slug} />;
}
