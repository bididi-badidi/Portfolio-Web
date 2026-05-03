import { cn } from "@/app/utils/cn";

export function ReminderCard({
  title,
  date,
  type = "work",
  description,
}: {
  title?: string;
  description?: string;
  date?: string;
  type?: string;
}) {
  return (
    <div
      className={`border rounded-xl shadow-md ${
        type.toLowerCase() == "work"
          ? "border-blue-800/50"
          : "border-purple-700/50"
      }`}
    >
      <div className="border-6 border-transparent">
        <div className="py-4 px-6 h-[200px] bg-glass backdrop-blur-md border border-glass-border rounded-lg shadow-md text-bright overflow-hidden flex flex-col justify-between">
          <h3 className="text-lg lg:text-xl font-semibold text-heading-from">
            {title}
          </h3>
          <p className="text-faint">{description}</p>
          {date && (
            <p className={cn("text-sm text-inverse bg-heading-from px-4 py-1 rounded-md font-bold self-end")}>
              {date}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
