import { WordItem } from "./WordItem";

interface TeamHistoryCardProps {
  team: any;
  isActive: boolean;
  index: number;
}

export const TeamHistoryCard = ({
  team,
  isActive,
  index,
}: TeamHistoryCardProps) => (
  <div
    className={`flex flex-col bg-[#111114]/70 border rounded-2xl p-4 transition-all max-h-[90vh] ${
      isActive
        ? "border-indigo-500/40 ring-1 ring-indigo-500/20 shadow-2xl"
        : "border-white/5 opacity-60"
    }`}
  >
    <div className="flex justify-between items-end mb-6 border-b border-white/5 pb-4 shrink-0">
      <div className="max-w-[70%]">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/30 mb-1">
          Team {index + 1}
        </h3>
        <p className="text-2xl font-black uppercase italic text-white truncate">
          {team.name}
        </p>
      </div>
      <div className="text-4xl font-black text-green-500">{team.score}</div>
    </div>
    <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 space-y-2 custom-scrollbar min-h-0">
      {[...team.history].reverse().map((item, i) => (
        <WordItem key={i} word={item.word} isCorrect={item.isCorrect} />
      ))}
    </div>
  </div>
);
