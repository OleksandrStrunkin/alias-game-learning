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
        className="py-4 rounded-xl border border-border text-destructive-foreground bg-destructive/40 font-black uppercase text-md tracking-widest hover:bg-destructive-hover transition-all disabled:opacity-20"
      >
        Skip
      </button>
      <button
        disabled={disabled}
        onClick={() => onAction(true)}
        className="py-4 rounded-xl border border-border bg-success/50 text-success-foreground font-black uppercase text-md tracking-widest hover:bg-success-hover transition-all disabled:opacity-20"
      >
        Got it
      </button>
    </div>
  );
};
