import { useUIState } from "@/app/context/UIStateContext";
import { HoverBorderGradient } from "@/components/ui/HoverBorderGradient";
import { ReactNode } from "react";
export const ModalTrigger = ({
  children,
  className,
  onOpen,
}: {
  children: ReactNode;
  className?: string;
  onOpen: () => void;
}) => {
  const { setChatOpen } = useUIState();
  return (
    <div
      className={className}
      onClick={() => {
        setChatOpen(true);
        setTimeout(() => onOpen(), 100);
      }}
    >
      <HoverBorderGradient
        containerClassName="rounded-full"
        as="button"
        className="bg-background/50 backdrop-blur-lg text-bright flex items-center px-8 cursor-pointer"
      >
        {children}
      </HoverBorderGradient>
    </div>
  );
};
