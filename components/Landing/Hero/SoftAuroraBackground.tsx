import { cn } from "@/app/utils/cn";
import SoftAurora from "@/components/ui/SoftAurora";

interface SoftAuroraBackgroundProps {
  className?: string;
}

export function SoftAuroraBackground({ className }: SoftAuroraBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-0 z-0 overflow-hidden bg-[linear-gradient(180deg,var(--color-bg-page-deep)_0%,var(--color-bg-page)_78%)]",
        className,
      )}
    >
      <SoftAurora
        speed={0.55}
        scale={1.65}
        brightness={0.78}
        color1="#6366f1"
        color2="#2563eb"
        noiseFrequency={2.22}
        noiseAmplitude={0.78}
        bandHeight={0.46}
        bandSpread={1.18}
        octaveDecay={0.18}
        layerOffset={0.34}
        colorSpeed={0.65}
        enableMouseInteraction={false}
        className="pointer-events-none opacity-90"
      />
    </div>
  );
}
