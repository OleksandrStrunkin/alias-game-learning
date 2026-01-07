import { WordItem } from "./WordItem";

interface TeamHistoryCardProps {
  team: any;
  isActive: boolean;
  index: number;
}

export const TeamHistoryCard = ({ team, isActive, index }: TeamHistoryCardProps) => (
  <div
    className={`flex flex-col p-4 rounded-2xl transition-all max-h-[90vh] backdrop-blur-xl shadow-lg
      ${
        isActive
          ? "bg-amber-100/10 border border-amber-400/30 shadow-amber-900/30 ring-1 ring-amber-400/20"
          : "bg-white/5 border border-white/10 opacity-70"
      }`}
  >
    <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4 shrink-0">
      <div className="max-w-[70%]">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-200/50 mb-1">
          Team {index + 1}
        </h3>
        <p className="text-2xl font-black uppercase italic text-amber-100 truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
          {team.name}
        </p>
      </div>
      <div className="text-4xl font-black text-amber-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
        {team.score}
      </div>
    </div>
    <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 space-y-2 custom-scrollbar min-h-0">
      {[...team.history].reverse().map((item, i) => (
        <WordItem key={i} word={item.word} isCorrect={item.isCorrect} />
      ))}
    </div>
  </div>
);
