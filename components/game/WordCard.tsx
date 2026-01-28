interface WordCardProps {
  isPaused: boolean;
  isLoading: boolean;
  isMyTurn: boolean;
  currentWord: { word: string; category: string; hint?: string } | null;
  activeTeamName?: string;
  showHint: boolean;
  onShowHint: () => void;
}

export const WordCard = ({
  isPaused,
  isLoading,
  isMyTurn,
  currentWord,
  activeTeamName,
  showHint,
  onShowHint,
}: WordCardProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-4 min-h-[220px] lg:min-h-[350px] relative">
      {isPaused ? (
        <div className="text-2xl uppercase tracking-[0.5em] text-amber-200/60 font-black italic animate-in fade-in duration-300">
          Paused
        </div>
      ) : isLoading ? (
        <div className="animate-pulse text-amber-400/50 uppercase text-xs tracking-widest font-black">
          Loading...
        </div>
      ) : isMyTurn ? (
        <div className="animate-in zoom-in duration-300 flex flex-col items-center">
          <span className="text-lg uppercase font-black tracking-[0.4em] text-amber-400 block h-7 mb-3">
            {currentWord?.category || " "}
          </span>
          <div className="min-h-[100px] flex items-center justify-center max-w-[280px] lg:max-w-none">
            <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter leading-tight text-amber-50 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
              {currentWord?.word}
            </h2>
          </div>

          <div className="h-[60px] mt-4 flex items-center justify-center">
            {currentWord?.hint ? (
              !showHint ? (
                <button
                  onClick={onShowHint}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-200/30 hover:text-amber-400 transition-colors py-2 px-4 border border-white/5 rounded-full bg-white/5"
                >
                  Show Translate
                </button>
              ) : (
                <p className="text-xl font-medium italic text-amber-400/80 animate-in fade-in slide-in-from-top-1 duration-300">
                  {currentWord.hint}
                </p>
              )
            ) : (
              <span className="text-[10px] text-white/5 uppercase tracking-widest">
                No hint available
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-300 text-amber-100/40 uppercase tracking-[0.4em] font-black italic">
          Player turn: <br /> {activeTeamName}
        </div>
      )}
    </div>
  );
};
