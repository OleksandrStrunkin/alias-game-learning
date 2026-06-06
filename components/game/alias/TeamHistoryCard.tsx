import { WordItem } from "./WordItem";

interface TeamHistoryCardProps {
  team: any;
  isActive: boolean;
  index: number;
}

export const TeamHistoryCard = ({ team, isActive, index }: TeamHistoryCardProps) => (
  <div
    className={`flex flex-col p-2 md:p-4 rounded-xl transition-all max-h-[90vh] backdrop-blur-xl shadow-lg
      ${
        isActive
          ? "bg-primary/10 border border-primary/30 shadow-primary/30 ring-1 ring-primary/20"
          : "bg-secondary/5 border border-border opacity-70"
      }`}
  >
    <div className="flex justify-between items-end mb-6 border-b border-border pb-4 shrink-0">
      <div className="max-w-[70%]">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/50 mb-1">
          Team {index + 1}
        </h3>
        <p className="text-sm md:text-2xl font-black uppercase italic text-primary truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
          {team.name}
        </p>
      </div>
      <div className="text-2xl md:text-4xl font-black text-primary drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
        {team.score}
      </div>
    </div>
    <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-2 custom-scrollbar min-h-0">
      {[...team.history].reverse().map((item, i) => (
        <WordItem key={i} word={item.word} isCorrect={item.isCorrect} />
      ))}
    </div>
  </div>
);
