import { adminClient, customSessionClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

export const { signIn, signOut, useSession, getSession, deleteUser, admin } =
  createAuthClient({
    plugins: [customSessionClient<typeof auth>(), adminClient()],
  });
