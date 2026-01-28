export const Timer = ({
  timeLeft,
  isOvertime,
}: {
  timeLeft: number;
  isOvertime: boolean;
}) => {
  return (
    <div className="text-6xl font-mono font-black text-amber-400 drop-shadow-[0_1px_3px_rgba(255,191,0,0.2)]">
      {isOvertime ? (
        <span className="animate-pulse text-3xl uppercase">Last Word</span>
      ) : (
        timeLeft
      )}
    </div>
  );
};
