import { ProjectSpotlightHero } from "@/components/Projects/ProjectSpotlightHero";

export function SpotlightHero({ id }: { id: string }) {
  return (
    <ProjectSpotlightHero
      id={id}
      title="StockAI"
      description={
        <>
          Simplify your financial research with a powerful command-line
          interface. stock provides a single, user-friendly hub for everything
          from real-time company reports and future earnings dates to in-depth
          research powered by an LLM.
        </>
      }
      cta={{ href: "#why", label: "See More" }}
    />
  );
}
