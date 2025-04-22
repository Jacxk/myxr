"use client";

import { Button } from "~/components/ui/button";
import { signIn } from "~/lib/auth-client";

export function SignInButton() {
  return (
    <Button onClick={() => signIn.social({ provider: "discord" })}>
      Sign in
    </Button>
  );
}
