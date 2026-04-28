import React from "react";
import Link from "next/link";

const navItems = [
  { label: "Dashboard", href: "/", icon: "🏠" },
  { label: "Alias", href: "/games/alias", icon: "🎲" },
  { label: "Settings", href: "#", icon: "⚙️", disabled: true },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 border-r border-amber-500/20 bg-[#1a1410] hidden md:flex flex-col h-[calc(100vh-64px)] sticky top-16">
      <nav className="p-4 flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.label}>
              {item.disabled ? (
                <div className="flex items-center gap-3 px-4 py-2 text-amber-500/30 cursor-not-allowed">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ) : (
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-amber-500/20 text-xs text-amber-500/50">
        &copy; 2024 CatherineGames
      </div>
    </aside>
  );
};
