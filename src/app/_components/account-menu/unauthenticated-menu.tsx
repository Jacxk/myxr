import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { SignInButton } from "~/components/ui/signin-button";
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
      <SignInButton component={DropdownMenuItem}>Sign In</SignInButton>
      <DropdownMenuSeparator />
      <ThemeSwitch />
    </NotAuthenticatedClient>
  );
}
