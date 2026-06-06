import React from "react";
import Link from "next/link";

const games = [
  {
    title: "Alias",
    description: "Explain words to your teammates without using forbidden words.",
    href: "/games/alias",
    icon: "🎲",
    status: "Active",
  },
  {
    title: "Speed Cards",
    description: "Match words with their translations as fast as you can.",
    href: "/games/speed-cards",
    icon: "⚡",
    status: "Active",
  },
  {
    title: "Grammar Battle",
    description: "Compete with others in grammar proficiency.",
    href: "#",
    icon: "⚔️",
    status: "Soon",
  },
];

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-bold text-primary mb-2">Welcome to CatherineGames</h1>
        <p className="text-primary/60">Choose your game and start learning English in a fun way!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <div
            key={game.title}
            className={`p-6 border rounded-xl transition-all ${
              game.status === "Active"
                ? "border-primary/30 bg-primary/5 hover:border-primary/60 cursor-pointer"
                : "border-border bg-secondary/5 opacity-60 cursor-not-allowed"
            }`}
          >
            <div className="text-4xl mb-4">{game.icon}</div>
            <h3 className="text-xl font-bold text-primary mb-2">{game.title}</h3>
            <p className="text-sm text-primary/70 mb-4">{game.description}</p>
            {game.status === "Active" ? (
              <Link
                href={game.href}
                className="inline-block px-4 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary-hover transition-colors"
              >
                Play Now
              </Link>
            ) : (
              <span className="inline-block px-3 py-1 bg-secondary/10 text-muted-foreground text-xs font-bold rounded-full">
                Coming Soon
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
