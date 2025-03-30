"use client";

import { ArrowDown } from "lucide-react";
import type { Guild } from "next-auth";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useModal } from "~/context/ModalContext";
import { api } from "~/trpc/react";

function generateBotInvite(guildId: string) {
  return `https://discord.com/oauth2/authorize?client_id=1293222273473318952&guild_id=${guildId}&disable_guild_select=true`;
}

function openInviteLink(guildId: string) {
  const inviteLink = generateBotInvite(guildId);
  window.open(inviteLink, "_blank", "noopener,noreferrer");
}

export function SelectGuild({
  guilds,
}: Readonly<{ guilds: Guild[] | undefined }>) {
  const { openModal, isOpen, closeModal, updateModal } = useModal();

  const [guildId, setGuildId] = useState<string>("");
  const [botAvailable, setBotAvailable] = useState<boolean>(false);
  const [tries, setTries] = useState<number>(0);

  const { mutateAsync, mutate, isPending, data } =
    api.guild.isBotIn.useMutation();

  const maxTries = 3;
  const defaultGuild = `${localStorage.getItem("guildId")}-${localStorage.getItem("guildName")}`;

  const onInviteClick = useCallback(() => {
    openInviteLink(guildId);
    updateModal({
      title: "Invite link generated",
      description:
        "We've opened a new tab with the invite link. If it didn't open try clicking the button again.",
    });
  }, [guildId]);

  async function selectGuild(guild: string) {
    const [id, name] = guild.split("-");
    const { success, value } = await mutateAsync(id!);

    if (!isPending && success && !value) {
      openModal({
        title: "We found a problem",
        description:
          "Looks like the bot is not in this guild. You need to invite it to the guild to continue.",
        footer: <Button onClick={onInviteClick}>Invite</Button>,
        authOnly: true,
      });
    } else if (!success) {
      toast.error("Something went wrong...");
    }

    setBotAvailable(success && value);
    setGuildId(id!);
    localStorage.setItem("guildId", id!);
    localStorage.setItem("guildName", name!);
  }

  useEffect(() => {
    const handleFocus = () => {
      mutate(guildId);
      setTries((tries) => tries + 1);
    };

    const removeListener = () =>
      window.removeEventListener("focus", handleFocus);

    if (!isOpen) {
      removeListener();
      setGuildId("");
      setTries(0);
      return;
    }

    window.addEventListener("focus", handleFocus);
    return removeListener;
  }, [guildId, isOpen]);

  useEffect(() => {
    if (isPending || botAvailable) return;

    if (data?.success && data.value) {
      closeModal();
      toast("Bot has been added!", { description: "You may continue..." });
      return;
    }

    if (tries > 0) {
      updateModal({
        title: "Oh no...",
        description:
          "We couldn't detect the bot inside the guild. Try inviting it again.",
      });
    }

    if (tries >= maxTries) {
      updateModal({
        title: "This is akward.",
        description: `We've tried ${tries} times to verify if the bot joined. Maybe try again later.`,
      });
    }
  }, [data, tries, isPending, botAvailable]);

  return (
    <Select onValueChange={selectGuild} defaultValue={defaultGuild ?? ""}>
      <SelectTrigger className="sm:min-w-[180px]" asChild>
        <div className="hidden sm:flex">
          <SelectValue placeholder="Select a Guild" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {guilds?.map((guild) => (
          <SelectItem key={guild.id} value={`${guild.id}-${guild.name}`}>
            {guild.name}
          </SelectItem>
        )) ?? (
          <SelectItem value="none" disabled>
            No guilds found
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
