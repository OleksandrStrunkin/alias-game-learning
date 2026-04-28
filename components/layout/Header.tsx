import React from "react";
import Link from "next/link";

export const Header = () => {
  return (
    <header className="h-16 border-b border-amber-500/20 bg-[#1a1410] flex items-center px-6 sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center text-[#1a1410] font-bold text-xl">
          C
        </div>
        <span className="text-xl font-bold tracking-tight text-amber-500">
          CatherineGames
        </span>
      </Link>
      <div className="ml-auto flex items-center gap-4 text-sm font-medium text-amber-500/70">
        <span>Learning English through games</span>
      </div>
    </header>
  );
};
