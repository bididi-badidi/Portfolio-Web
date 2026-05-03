import { cn } from "@/lib/utils";
import { ResumeButton } from "./ResumeButton";
import { LinkPreview } from "@/components/Contact/LinkPreview";
import { AILink } from "./AILink";
import { FadeUpInView } from "@/components/ui/FadeUpInView";
import { themeClasses } from "@/app/styles/themeClasses";
import { SoftAuroraHero } from "./SoftAuroraHero";

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
              "relative text-5xl lg:text-6xl font-bold inline-block",
            )}
            isStatic
            imageSrc="/image/preview-personal-ai.png"
          >
            <AILink />
          </LinkPreview>{" "}
          <span className={heroTextClassName}>Solutions</span>
        </h1>
        <p
          className={cn(
            themeClasses.text.primary,
            "w-[30ch] lg:w-[45ch] lg:text-lg opacity-65 hero-text mb-6",
          )}
        >
          LLM integrations to automated data pipelines—turning manual tasks into intelligent systems.
        </p>
        <FadeUpInView delay={3.5} initialOpacity={0} className="text-center">
          <ResumeButton />
        </FadeUpInView>
      </div>
    </SoftAuroraHero>
  );
}
