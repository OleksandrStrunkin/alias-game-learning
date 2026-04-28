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
    title: "English Crosswords",
    description: "Expand your vocabulary by solving daily crosswords.",
    href: "#",
    icon: "📝",
    status: "Soon",
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
        <h1 className="text-4xl font-bold text-amber-500 mb-2">Welcome to CatherineGames</h1>
        <p className="text-amber-500/60">Choose your game and start learning English in a fun way!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <div
            key={game.title}
            className={`p-6 border rounded-xl transition-all ${
              game.status === "Active"
                ? "border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60 cursor-pointer"
                : "border-white/5 bg-white/5 opacity-60 cursor-not-allowed"
            }`}
          >
            <div className="text-4xl mb-4">{game.icon}</div>
            <h3 className="text-xl font-bold text-amber-500 mb-2">{game.title}</h3>
            <p className="text-sm text-amber-500/70 mb-4">{game.description}</p>
            {game.status === "Active" ? (
              <Link
                href={game.href}
                className="inline-block px-4 py-2 bg-amber-500 text-[#1a1410] font-bold rounded-lg hover:bg-amber-400 transition-colors"
              >
                Play Now
              </Link>
            ) : (
              <span className="inline-block px-3 py-1 bg-white/10 text-white/50 text-xs font-bold rounded-full">
                Coming Soon
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
