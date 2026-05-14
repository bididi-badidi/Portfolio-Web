import {
  Bot,
  CheckCircle2,
  FileSearch,
  GitBranch,
  MessageSquareText,
  Newspaper,
  TerminalSquare,
  WalletCards,
} from "lucide-react";
import { themeClasses } from "@/app/styles/themeClasses";
import { cn } from "@/app/utils/cn";

const researchFlow = [
  { label: "Reception", icon: MessageSquareText },
  { label: "Lead Planner", icon: GitBranch },
  { label: "Research Agents", icon: FileSearch },
  { label: "Citation Check", icon: CheckCircle2 },
];

const assistantFlow = [
  { label: "Secretary", icon: Newspaper },
  { label: "Coding Agent", icon: TerminalSquare },
  { label: "Financial Analyst", icon: WalletCards },
  { label: "Telegram", icon: Bot },
];

export function WorkflowDiagram({ variant }: { variant: "research" | "assistants" }) {
  const items = variant === "research" ? researchFlow : assistantFlow;

  return (
    <div
      className={cn(
        themeClasses.surface.glass,
        "relative grid min-h-[300px] w-full place-items-center overflow-hidden rounded-xl p-5",
        "shadow-[0_18px_60px_rgb(0_0_0_/_0.28),inset_0_1px_0_rgb(255_255_255_/_0.08)]",
      )}
    >
      <div className="absolute inset-x-8 top-1/2 hidden h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent lg:block" />
      <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="relative rounded-lg border border-glass-border bg-white/[0.025] p-4 text-center backdrop-blur-xl"
            >
              <div className="mx-auto mb-4 grid size-12 place-items-center rounded-[14px] border border-glass-border bg-glass">
                <Icon className="size-5 text-bright" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-bright">{item.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
