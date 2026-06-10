import { useState } from "react";

interface Props {
  onCreateDuel: () => void;
  onOpenJoinRoom: (code: string) => Promise<void>;
  onStartSolo: () => void;
}

export const SpeedCardsSetup = ({
  onCreateDuel,
  onOpenJoinRoom,
  onStartSolo,
}: Props) => {
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [inputCode, setInputCode] = useState("");

  return (
    <div className="flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md backdrop-blur-xl bg-secondary/10 border border-border shadow-2xl shadow-black/40 rounded-[2.5rem] p-10 text-center">
        <h1 className="text-3xl font-black text-primary mb-2 tracking-widest uppercase italic drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
          Speed Cards
        </h1>
        <p className="text-primary/60 mb-10 text-sm tracking-widest uppercase">
          CatherineGames Platform
        </p>

        <div className="space-y-4">
          {/* Solo Mode */}
          <button
            onClick={() => {
              onStartSolo();
            }}
            className="w-full py-4 rounded-2xl font-bold uppercase tracking-widest bg-primary/50 hover:bg-primary text-primary-foreground transition-all flex flex-col items-center justify-center gap-1"
          >
            <span className="text-lg">👤 Solo Play</span>
          </button>

          <div className="flex items-center gap-4 my-6 text-primary/40">
            <div className="h-px bg-primary/20 flex-1" />
            <span className="text-xs font-semibold">or battle</span>
            <div className="h-px bg-primary/20 flex-1" />
          </div>

          {/* Duel Mode */}
          {!showJoinInput ? (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  onCreateDuel();
                }}
                className="py-4 rounded-2xl font-bold uppercase tracking-widest bg-secondary/5 text-primary border border-border hover:bg-secondary/10 transition-all shadow-sm text-[10px]"
              >
                Create Duel
              </button>
              <button
                onClick={() => setShowJoinInput(true)}
                className="py-4 rounded-2xl font-bold uppercase tracking-widest bg-secondary/5 text-primary border border-border hover:bg-secondary/10 transition-all shadow-sm text-[10px]"
              >
                Join Duel
              </button>
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
              <input
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                className="w-full bg-secondary/10 border border-border p-4 rounded-2xl text-center uppercase text-primary placeholder-primary/30 shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowJoinInput(false)}
                  className="py-3 text-[10px] font-bold uppercase text-primary/50 hover:text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onOpenJoinRoom(inputCode)}
                  className="py-3 bg-primary text-primary-foreground rounded-xl font-bold uppercase text-[10px] tracking-widest"
                >
                  Connect
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="mt-8 text-xs text-primary/40 tracking-widest">
          Test your memory speed ✨
        </p>
      </div>
    </div>
  );
};
