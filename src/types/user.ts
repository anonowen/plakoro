export type UserRole = "admin" | "user";

/** A user profile document stored in Firestore at `users/{uid}`. Created
 *  automatically on first sign-in with role "user" — promoting someone
 *  to "admin" is done manually in the Firebase console (Firestore data
 *  tab) by an existing admin, never through the app itself. */
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: number; // epoch ms
}
