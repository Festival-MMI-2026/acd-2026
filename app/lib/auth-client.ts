import { createAuthClient } from "better-auth/vue";

export const authClient = createAuthClient({});

// Export specific methods for convenience
export const { signIn, signUp, signOut, useSession } = authClient;
