"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { useEffect, useState } from "react";
import { EmojiImage } from "~/components/emoji-image";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useTRPC } from "~/trpc/react";

export default function MasterRolesSelect({ guildId }: { guildId: string }) {
  const api = useTRPC();
  const { data: roles } = useQuery(
    api.guild.getGuildRoles.queryOptions(guildId),
  );
  const { mutate } = useMutation(
    api.guild.setSoundMasterRoles.mutationOptions(),
  );

  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const onCheckedChange = (checked: boolean, roleId: string) => {
    setSelectedRoles((prev) => {
      const roles = checked
        ? [...prev, roleId]
        : prev.filter((id) => id !== roleId);
      return roles;
    });
  };

  useEffect(() => {
    mutate({ guildId, roles: selectedRoles });
  }, [guildId, selectedRoles, mutate]);

  return (
    <DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger className="self-end" asChild>
          <Button variant="outline" size="icon">
            <Users />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>Select Sound Master Roles</DropdownMenuLabel>
          <DropdownMenuLabel className="text-muted-foreground text-xs">
            Select the roles that can manage the sound of the guild.
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {(!roles || roles.length === 0) && (
            <DropdownMenuCheckboxItem disabled>
              No roles found
            </DropdownMenuCheckboxItem>
          )}
          {roles?.map((role) => (
            <DropdownMenuCheckboxItem
              key={role.id}
              checked={role.isMasterRole || selectedRoles.includes(role.id)}
              onSelect={(event) => event.preventDefault()}
              onCheckedChange={(checked) => onCheckedChange(checked, role.id)}
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
        </DropdownMenuContent>
      </DropdownMenu>
    </DropdownMenu>
  );
}
