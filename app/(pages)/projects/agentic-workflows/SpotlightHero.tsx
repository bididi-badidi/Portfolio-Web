import { ProjectSpotlightHero } from "@/components/Projects/ProjectSpotlightHero";

export function SpotlightHero({ id }: { id: string }) {
  return (
    <ProjectSpotlightHero
      id={id}
      title={<>Agentic Workflows</>}
      description={
        <>
          A collection of multi-agent systems that gather intent, divide work,
          verify outputs, and deliver useful results through familiar channels.
        </>
      }
      cta={{ href: "#projects", label: "View Workflows" }}
    />
  );
}
