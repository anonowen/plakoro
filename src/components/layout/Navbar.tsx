import { NavLink } from "react-router-dom";
import { Dices } from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "./ThemeToggle";
import { SignInButton } from "@/components/auth/SignInButton";

export function Navbar() {
  const { isAdmin } = useAuth();

  const navLinks = [
    { to: "/", label: "Pokédex" },
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <NavLink to="/" className="flex items-center gap-2 font-bold">
          <Dices className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">Plakoro Dice Calculator</span>
          <span className="sm:hidden">Plakoro</span>
        </NavLink>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
          <ThemeToggle />
          <SignInButton />
        </nav>
      </div>
    </header>
  );
}
