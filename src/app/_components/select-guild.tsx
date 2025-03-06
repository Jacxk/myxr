"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { InviteBotDialog } from "./invite-bot-dialog";

export function SelectGuild({
  guilds,
}: Readonly<{ guilds: { id: string; name: string }[] | undefined }>) {
  const [guildSelected, setGuildSelected] = useState<string>("");
  const [modalOpenned, setModalOpenned] = useState<boolean>();

  function selectGuild(id: string) {
    setGuildSelected(id);
    setModalOpenned(true);
  }

  return (
    <>
      {modalOpenned && (
        <InviteBotDialog
          open={modalOpenned}
          guildId={guildSelected}
          setOpen={setModalOpenned}
        />
      )}
      <Select onValueChange={selectGuild}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a Guild" />
        </SelectTrigger>
        <SelectContent>
          {guilds?.map((guild) => (
            <SelectItem key={guild.id} value={guild.id}>
              {guild.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}
