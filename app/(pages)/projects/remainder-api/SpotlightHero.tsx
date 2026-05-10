import { ProjectSpotlightHero } from "@/components/Projects/ProjectSpotlightHero";

export function SpotlightRemainders({ id }: { id: string }) {
  return (
    <ProjectSpotlightHero
      id={id}
      title="RemAInders"
      description={
        <>
          Flexibility and extensibility are key to integrating new features into
          digital ecosystem. For example, automatically reminding your
          colleagues to attend meeting happening this afternoon via an AI.
        </>
      }
    />
  );
}
