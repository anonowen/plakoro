import { LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

export function SignInButton() {
  const { user, profile, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) {
    return (
      <div className="h-9 w-9 animate-pulse rounded-full bg-muted" aria-hidden />
    );
  }

  if (!user) {
    return (
      <Button variant="outline" size="sm" onClick={() => void signInWithGoogle()}>
        <LogIn className="h-4 w-4" /> Sign in
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {profile?.photoURL && (
        <img
          src={profile.photoURL}
          alt={profile.displayName ?? "User avatar"}
          className="h-8 w-8 rounded-full"
          referrerPolicy="no-referrer"
        />
      )}
      <span className="hidden text-sm font-medium sm:inline">
        {profile?.displayName ?? profile?.email}
      </span>
      <Button variant="ghost" size="icon" title="Sign out" onClick={() => void signOut()}>
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
