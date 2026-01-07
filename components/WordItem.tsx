interface WordItemProps {
  word: string;
  isCorrect: boolean;
}

export const WordItem = ({ word, isCorrect }: WordItemProps) => (
  <div
    className={`flex items-center justify-between px-2 py-1 border-b 
                ${
                  isCorrect ? "border-b-emerald-500/30" : "border-b-rose-700/30"
                }
                transition-all`}
  >
    <span
      className={`text-lg font-bold uppercase tracking-tight truncate max-w-[80%] ${
        isCorrect
          ? "text-emerald-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
          : "text-rose-300/60 italic line-through"
      }`}
    >
      {word}
    </span>
    <span
      className={`text-lg font-black ${
        isCorrect ? "text-emerald-400" : "text-rose-400"
      }`}
    >
      {isCorrect ? "✓" : "✕"}
    </span>
  </div>
);
