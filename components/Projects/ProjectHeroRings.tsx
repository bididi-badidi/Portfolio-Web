"use client";

import MagicRings from "@/components/MagicRings";

export function ProjectHeroRings({ onStatic }: { onStatic?: () => void }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgb(99_102_241_/_0.12),transparent_42%),radial-gradient(circle_at_58%_52%,rgb(34_211_238_/_0.08),transparent_42%)]" />
      <div className="absolute inset-0 opacity-75">
        <MagicRings
          color="#6366f1"
          colorTwo="#2563eb"
          speed={5.5}
          ringCount={8}
          attenuation={7.6}
          lineThickness={1.25}
          baseRadius={0.16}
          radiusStep={0.085}
          scaleRate={0.22}
          opacity={0.82}
          blur={0.2}
          noiseAmount={0.025}
          rotation={-15}
          ringGap={1.34}
          fadeIn={0.62}
          fadeOut={0.76}
          staticAt={3.6}
          playOnce
          onStatic={onStatic}
        />
      </div>
    </div>
  );
}
