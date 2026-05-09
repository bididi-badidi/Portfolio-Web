import { cn } from "@/lib/utils";
import { LinkPreview } from "@/components/Contact/LinkPreview";
import { AILink } from "./AILink";
import { themeClasses } from "@/app/styles/themeClasses";
import { SoftAuroraHero } from "./SoftAuroraHero";
import { HeroIntroSequence } from "./HeroIntroSequence";

export function SectionHero({ id }: { id: string }) {
  const heroTextClassName = cn(themeClasses.gradient.heroHeading, "hero-text");

  return (
    <SoftAuroraHero id={id}>
      <div
        className={cn(
          "text-center font-medium tracking-tight place-items-center",
        )}
      >
        <h1 className={cn("py-4 text-4xl md:text-5xl lg:text-5xl mb-4 ")}>
          <span className={heroTextClassName}>
            My name is Zi Shen
            <br />
            <br />I Build{" "}
          </span>
          <LinkPreview
            url="./projects/personal-ai"
            className={cn(
              "relative z-50 text-5xl lg:text-6xl font-bold inline-block",
            )}
            isStatic
            imageSrc="/image/preview-personal-ai.png"
          >
            <AILink />
          </LinkPreview>{" "}
          <span className={heroTextClassName}>Solutions</span>
        </h1>
        <HeroIntroSequence />
      </div>
    </SoftAuroraHero>
  );
}
