import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/** Gates its children behind Google sign-in AND the "admin" Firestore
 *  role. Everyone else sees a sign-in prompt or an access-denied message
 *  instead of the protected content. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading, signInWithGoogle } = useAuth();

  if (loading) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-muted-foreground">
        Checking your account…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
            <ShieldAlert className="h-10 w-10 text-muted-foreground" />
            <p className="font-medium">Sign in required</p>
            <p className="text-sm text-muted-foreground">
              This page is restricted to admins. Sign in with Google to continue.
            </p>
            <Button onClick={() => void signInWithGoogle()}>Sign in with Google</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
            <ShieldAlert className="h-10 w-10 text-destructive" />
            <p className="font-medium">Admin access required</p>
            <p className="text-sm text-muted-foreground">
              Your account ({user.email}) doesn't have admin permissions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
