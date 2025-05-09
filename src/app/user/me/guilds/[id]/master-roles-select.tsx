"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { EmojiImage } from "~/components/emoji-image";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ErrorToast } from "~/lib/messages/toast.global";
import { useTRPC } from "~/trpc/react";

export default function MasterRolesSelect({ guildId }: { guildId: string }) {
  const api = useTRPC();
  const {
    data: roles,
    isRefetching,
    isLoading,
    refetch,
  } = useQuery(
    api.guild.getGuildRoles.queryOptions(guildId, {
      enabled: false,
    }),
  );
  const { mutate } = useMutation(
    api.guild.setSoundMasterRoles.mutationOptions({
      onSuccess: (data) => {
        setSelectedRoles(data);
      },
      onError: () => {
        ErrorToast.unauthorized();
      },
    }),
  );

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    if (roles) {
      setSelectedRoles(
        roles.filter((role) => role.isMasterRole).map((role) => role.id),
      );
    }
  }, [roles]);

  const onCheckedChange = (checked: boolean, roleId: string) => {
    const roles = checked
      ? [...selectedRoles, roleId]
      : selectedRoles.filter((id) => id !== roleId);

    mutate({ guildId, roles });
    setSelectedRoles(roles);
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && !isRefetching && refetch()}>
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
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="max-h-[300px] w-56 overflow-y-auto">
              <DropdownMenuLabel>Select Sound Master Roles</DropdownMenuLabel>
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Select the roles that can manage the sound of the guild.
              </DropdownMenuLabel>
              {isLoading && (
                <DropdownMenuCheckboxItem disabled>
                  Loading...
                </DropdownMenuCheckboxItem>
              )}
              {roles?.length === 0 && (
                <DropdownMenuCheckboxItem disabled>
                  No roles found
                </DropdownMenuCheckboxItem>
              )}
              {roles?.map((role) => (
                <DropdownMenuCheckboxItem
                  key={role.id}
                  checked={selectedRoles.includes(role.id)}
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={(checked) =>
                    onCheckedChange(checked, role.id)
                  }
                  style={{
                    borderLeft: `6px solid #${role.color.toString(16).padStart(6, "0")}`,
                  }}
                >
                  {role.unicode_emoji && (
                    <EmojiImage
                      emoji={role.unicode_emoji}
                      size={{ width: 16, height: 16 }}
                    />
                  )}
                  {role.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
