import { ProjectSpotlightHero } from "@/components/Projects/ProjectSpotlightHero";

export function SpotlightHero({ id }: { id: string }) {
  return (
    <ProjectSpotlightHero
      id={id}
      title="Event Capture"
      description={
        <>
          Speak or type, and let the app handle the rest. This tool
          automatically processes your voice and text commands, effortlessly
          adding new events to your calendar for instant, hands-free scheduling.
        </>
      }
      cta={{ href: "#why", label: "See More" }}
    />
  );
}
