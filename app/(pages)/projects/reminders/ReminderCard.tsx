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
      className={`border  rounded-xl shadow-md ${
        type.toLowerCase() == "work"
          ? "border-blue-800/50"
          : "border-purple-700/50"
      }`}
    >
      <div className="border-6 border-transparent">
        <div className=" py-4 px-6 h-[200px] bg-black/30 backdrop-blur-md border border-white/10  rounded-lg shadow-md text-bright overflow-hidden flex flex-col justify-between">
          <h3 className="text-lg lg:text-xl font-semibold text-slate-300">
            {title}
          </h3>
          <p className="text-gray-600">{description}</p>
          {date && (
            <p className="text-sm text-slate-700 bg-slate-300 px-4 py-1 rounded-md font-bold self-end">
              {date}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
