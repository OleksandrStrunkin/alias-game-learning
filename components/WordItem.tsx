interface WordItemProps {
  word: string;
  isCorrect: boolean;
}

export const WordItem = ({ word, isCorrect }: WordItemProps) => (
  <div
    className={`flex items-center justify-between p-1 border-b transition-all ${
      isCorrect
        ? " border-b-emerald-500"
        : " border-rose-700"
    }`}
  >
    <span
      className={`text-lg font-bold uppercase tracking-tight truncate max-w-[80%] ${
        isCorrect ? "text-emerald-400" : "text-rose-300/60 line-through italic"
      }`}
    >
      {word}
    </span>
    <span
      className={`text-lg font-black ${
        isCorrect ? "text-emerald-500" : "text-rose-400"
      }`}
    >
      {isCorrect ? "✓" : "✕"}
    </span>
  </div>
);
