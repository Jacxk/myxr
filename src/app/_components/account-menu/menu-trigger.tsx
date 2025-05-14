import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

import { DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { getServerSession } from "~/lib/auth";
import {
  AuthenticatedClient,
  NotAuthenticatedClient,
} from "../authentication-client";

export async function MenuTrigger() {
  const session = await getServerSession();
  const user = session?.user;

  return (
    <DropdownMenuTrigger
      className="flex cursor-pointer items-center gap-2"
      asChild
    >
      <Avatar>
        <AuthenticatedClient>
          <AvatarImage src={user?.image + "?size=40"} alt={user?.name} />
          <AvatarFallback delayMs={500}>
            {user?.name[0]?.toUpperCase()}
          </AvatarFallback>
        </AuthenticatedClient>
        <NotAuthenticatedClient>
          <AvatarImage />
          <AvatarFallback delayMs={0}>
            <User />
          </AvatarFallback>
        </NotAuthenticatedClient>
      </Avatar>
    </DropdownMenuTrigger>
  );
}
