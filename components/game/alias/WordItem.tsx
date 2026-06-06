interface WordItemProps {
  word: string;
  isCorrect: boolean;
}

export const WordItem = ({ word, isCorrect }: WordItemProps) => (
  <div
    className={`flex items-center justify-between md:py-1 border-b 
                ${
                  isCorrect ? "border-b-success/30" : "border-b-destructive/30"
                }
                transition-all`}
  >
    <span
      className={`text-sm md:text-lg font-bold uppercase tracking-tight truncate max-w-[90%] ${
        isCorrect
          ? "text-success drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
          : "text-destructive/60 italic line-through"
      }`}
    >
      {word}
    </span>
    <span
      className={`text-sm md:text-lg font-black ${
        isCorrect ? "text-success" : "text-destructive"
      }`}
    >
      {isCorrect ? "✓" : "✕"}
    </span>
  </div>
);
