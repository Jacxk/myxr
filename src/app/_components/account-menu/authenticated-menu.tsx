"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { signOut, useSession } from "~/lib/auth-client";
import { AuthenticatedClient } from "../authentication-client";
import { ThemeSwitch } from "./theme-switch";

export function AuthenticatedMenu() {
  const { data: session } = useSession();
  const router = useRouter();

  const user = session?.user;

  if (!user) return null;

  return (
    <AuthenticatedClient>
      <DropdownMenuLabel className="flex justify-between">
        <span className="text-muted-foreground">Hello</span>
        <Button variant="link" className="h-fit p-0" asChild>
          <Link href={`/user/${user.id}`}>{user.name}</Link>
        </Button>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <Link href={"/user/me"}>
        <DropdownMenuItem>Profile</DropdownMenuItem>
      </Link>
      <DropdownMenuSeparator />
      <ThemeSwitch />
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={() =>
          signOut({
            fetchOptions: {
              onSuccess() {
                router.push("/");
              },
            },
          })
        }
      >
        Sign out
      </DropdownMenuItem>
    </AuthenticatedClient>
  );
}
