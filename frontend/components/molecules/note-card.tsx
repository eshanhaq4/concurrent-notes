interface NoteCardProps {
  content: string;
  color?: string;
  date?: string;
  summary?: string;
  status?: string;
  onClick?: () => void;
}

export function NoteCard({
  content,
  color = "#FCA5A5",
  date,
  summary,
  status,
  onClick,
}: NoteCardProps) {
  return (
    <article
      onClick={onClick}
      className="p-6 rounded-2xl shadow-sm min-h-[200px] flex flex-col justify-between cursor-pointer transition-transform hover:scale-105"
      style={{ backgroundColor: color }}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
      {status === "PROCESSING" && (
        <p className="text-xs mt-2 text-gray-600">Processing...</p>
      )}
      {status === "FAILED" && (
        <p className="text-xs mt-2 text-red-600">Summary could not be generated</p>
      )}
      {status === "COMPLETED" && summary && (
        <p className="text-xs mt-2 text-black font-semibold">
          Summary: {summary}
        </p>
      )}
      {date && (
        <time
          className="text-xs text-gray-600 mt-4"
          dateTime={new Date(date).toISOString()}
        >
          {date}
        </time>
      )}
    </article>
  );
}
