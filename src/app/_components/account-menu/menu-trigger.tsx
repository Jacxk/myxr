"use client";

import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

import { DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { useSession } from "~/lib/auth-client";
import {
  AuthenticatedClient,
  NotAuthenticatedClient,
} from "../authentication-client";

export function MenuTrigger() {
  const { data: session } = useSession();
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
          <AvatarFallback delayMs={0}>
            <User />
          </AvatarFallback>
        </NotAuthenticatedClient>
      </Avatar>
    </DropdownMenuTrigger>
  );
}
