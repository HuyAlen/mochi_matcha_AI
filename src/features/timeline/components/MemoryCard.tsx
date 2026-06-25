interface MemoryCardProps {
  title: string;
  date: string;
  baby: string;
  emoji: string;
  description: string;
}

export default function MemoryCard({
  title,
  date,
  baby,
  emoji,
  description,
}: MemoryCardProps) {
  return (
    <article className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start gap-4">
        <div className="flex size-16 items-center justify-center rounded-3xl bg-linear-to-br from-pink-100 to-purple-100 text-4xl">
          {emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-pink-500">
            {date} · {baby}
          </p>
          <h3 className="mt-1 font-black text-slate-950">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
      </div>
    </article>
  );
}
