"use client";

import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { signIn } from "~/lib/auth-client";
import { NotAuthenticatedClient } from "../authentication-client";
import { ThemeSwitch } from "./theme-switch";

export function UnAuthenticatedMenu() {
  return (
    <NotAuthenticatedClient>
      <DropdownMenuLabel className="flex justify-between">
        <span className="text-muted-foreground">Hello</span>
        <span>Guest</span>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => signIn.social({ provider: "discord" })}>
        Sign In
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <ThemeSwitch />
    </NotAuthenticatedClient>
  );
}
