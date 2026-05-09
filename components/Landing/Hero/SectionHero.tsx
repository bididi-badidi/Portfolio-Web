import { SoftAuroraHero } from "./SoftAuroraHero";
import { HeroRevealContent } from "./HeroRevealContent";

export function SectionHero({ id }: { id: string }) {
  return (
    <SoftAuroraHero id={id}>
      <HeroRevealContent />
    </SoftAuroraHero>
  );
}
