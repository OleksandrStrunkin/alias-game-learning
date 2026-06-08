import Link from "next/link";

export const Header = () => {
  return (
    <header className="h-16 border-b border-primary/20 bg-background flex items-center px-6 sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
          A
        </div>
        <span className="text-xl font-bold tracking-tight text-primary">
          Alias Game
        </span>
      </Link>
      <div className="ml-auto flex items-center gap-4 text-sm font-medium text-primary/70">
        <span>Learning English through games</span>
      </div>
    </header>
  );
};
