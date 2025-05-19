import { Settings2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import MasterRolesSelect from "./master-roles-select";
import NotificationsSelect from "./notifications-select";

export default function ConfigSelect({ guildId }: { guildId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="self-end" asChild>
        <Button variant="outline" size="icon" className="mx-2">
          <Settings2 />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="max-h-[300px] max-w-56 overflow-y-auto"
        align="end"
      >
        <DropdownMenuLabel>Edit Server Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Sound Master Role</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <MasterRolesSelect guildId={guildId} />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Notifications</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <NotificationsSelect guildId={guildId} />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
