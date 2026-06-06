import React from "react";
import Link from "next/link";

const navItems = [
  { label: "Dashboard", href: "/", icon: "🏠" },
  { label: "Alias", href: "/games/alias", icon: "🎲" },
  { label: "Speed Cards", href: "/games/speed-cards", icon: "⚡" },
  { label: "Settings", href: "#", icon: "⚙️", disabled: true },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 border-r border-primary/20 bg-background hidden md:flex flex-col h-[calc(100vh-64px)] sticky top-16">
      <nav className="flex-1 p-4 flex flex-col gap-2">
        {navItems.map((item) => (
          <div key={item.label}>
            {item.disabled ? (
              <div className="flex items-center gap-3 px-4 py-2 text-primary/30 cursor-not-allowed">
                {item.icon}
                <span>{item.label}</span>
              </div>
            ) : (
              <Link
                href={item.href}
                className="flex items-center gap-3 px-4 py-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-primary/20 text-xs text-primary/50">
        &copy; 2026 CatherineGames
      </div>
    </aside>
  );
};
