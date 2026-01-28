interface Props {
  onAction: (isCorrect: boolean) => void;
  disabled: boolean;
}

export const GameControls = ({ onAction, disabled }: Props) => {
  return (
    <div className="grid grid-cols-2 gap-4 mt-8">
      <button
        disabled={disabled}
        onClick={() => onAction(false)}
        className="py-4 rounded-xl border border-white/10 text-amber-50 bg-rose-700/40 font-black uppercase text-md tracking-widest hover:bg-rose-700/60 transition-all disabled:opacity-20"
      >
        Skip
      </button>
      <button
        disabled={disabled}
        onClick={() => onAction(true)}
        className="py-4 rounded-xl border border-white/10 bg-emerald-600/50 text-amber-50 font-black uppercase text-md tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-20"
      >
        Got it
      </button>
    </div>
  );
};
