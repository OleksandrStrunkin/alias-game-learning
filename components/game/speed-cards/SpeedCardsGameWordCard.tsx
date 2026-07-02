import { useShallow } from "zustand/react/shallow";
import { useSpeedCardsStore } from "@/store/useSpeedCardsStore";

interface SpeedCardsGameWordCardProps {
  cardId: string;
  isMyTurn: boolean;
  handleSelectCard: (id: string) => void;
}

export const SpeedCardsGameWordCard = ({
  cardId,
  isMyTurn,
  handleSelectCard,
}: SpeedCardsGameWordCardProps) => {
  const card = useSpeedCardsStore((s) => s.cards.find((c) => c.id === cardId));
  const isSelected = useSpeedCardsStore((s) => s.selectedCardId === cardId);

  const isFailed = useSpeedCardsStore(
    useShallow((s) => s.failedPair?.includes(cardId) ?? false),
  );
  const hasFailedPair = useSpeedCardsStore((s) => !!s.failedPair);

  if (!card) return null;

  return (
    <button
      onClick={() => !card.isMatched && handleSelectCard(card.id)}
      disabled={card.isMatched || !isMyTurn || hasFailedPair}
      className={`h-24 p-2 rounded-2xl border-2 transition-all flex items-center justify-center text-center font-bold uppercase text-[clamp(1rem,2vw,1.5rem)] leading-tight break-all
        ${
          card.isMatched
            ? "opacity-0 scale-90 pointer-events-none"
            : isFailed
              ? "bg-destructive/20 border-destructive text-destructive scale-100 shadow-none animate-pulse"
              : isSelected
                ? "bg-primary border-primary text-primary-foreground scale-105 rotate-2 shadow-2xl shadow-primary/40"
                : isMyTurn
                  ? "bg-secondary/5 border-border hover:border-primary/50 hover:bg-secondary/10 cursor-pointer"
                  : "bg-secondary/2 border-border/40 opacity-70 cursor-not-allowed"
        }`}
    >
      {card.text}
    </button>
  );
};
