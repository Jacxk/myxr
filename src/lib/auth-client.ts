import { customSessionClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { auth } from "./auth";

export const { signIn, signOut, useSession, getSession } = createAuthClient({
  plugins: [customSessionClient<typeof auth>()],
});
