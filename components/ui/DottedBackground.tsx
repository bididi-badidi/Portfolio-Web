import React from "react";
import svgToDataUri from "mini-svg-data-uri";

export function DottedBackground({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-dvh w-dvw relative items-center justify-center"
      style={{
        backgroundImage: `url("${svgToDataUri(
          `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="rgba(200,200,200,0.2)" id="pattern-circle" cx="10" cy="10" r="1.6257413380501518"></circle></svg>`,
        )}")`,
      }}
    >
      <div className="z-4 h-full w-full absolute pointer-events-none inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_farthest-corner_at_center,rgba(0,0,0,0)_50%,#0a0a0a)]"></div>
      {children}
    </div>
  );
}

export function DottedInnerWrapper({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`w-full items-center justify-center flex flex-col px-[10px] lg:px-[10dvw] ${className}`}>
      {children}
    </div>
  );
}
