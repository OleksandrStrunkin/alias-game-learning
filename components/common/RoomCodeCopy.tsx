import { useState } from "react";

interface RoomCodeCopyProps {
  roomCode: string | null;
}

export const RoomCodeCopy = ({roomCode}: RoomCodeCopyProps) => {

    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
    if (!roomCode) return;

    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);

      setTimeout(() => setCopied(false), 1000);
    } catch (err) {
      console.error("Не вдалося скопіювати:", err);
    }
  };


    return <>
        <div className="flex flex-col mb-5 md:flex-row justify-center items-center gap-4">
            <h2 className="text-3xl font-black text-primary tracking-widest uppercase italic drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
              Room:
            </h2>
            <code className="text-xl flex flex-row italic font-mono bg-primary/10 px-4 py-1 rounded-sm border border-primary/20">
              {roomCode}
            </code>
            <button
              onClick={handleCopy}
              className={`
          flex items-center border border-primary/20 w-35 gap-2 px-4 py-2 rounded-sm italic font-medium text-sm transition-all duration-200
          ${copied ? "bg-emerald-500/50" : "bg-primary/10 hover:bg-primary/30"}
        `}
            >
              {copied ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 text-slate-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
    </>
}