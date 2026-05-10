import { ProjectSpotlightHero } from "@/components/Projects/ProjectSpotlightHero";

export function SpotlightHero({ id }: { id: string }) {
  return (
    <ProjectSpotlightHero
      id={id}
      title={
        <>
          Meet My Personal <br /> AI Assistant
        </>
      }
      description={
        <>
          Explore my portfolio interactively! This AI assistant can answer your
          questions about my skills and projects, or even help you get in touch
          and navigate the website.
        </>
      }
      cta={{ href: "#why", label: "Start Exploring" }}
    />
  );
}
