import {
  DropdownMenu,
  DropdownMenuContent,
} from "~/components/ui/dropdown-menu";
import { AuthenticatedMenu } from "../account-menu/authenticated-menu";
import { MenuTrigger } from "../account-menu/menu-trigger";
import { UnAuthenticatedMenu } from "../account-menu/unauthenticated-menu";

export function AccountMenu() {
  return (
    <DropdownMenu>
      <MenuTrigger />
      <DropdownMenuContent className="w-40" align="end">
        <AuthenticatedMenu />
        <UnAuthenticatedMenu />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
