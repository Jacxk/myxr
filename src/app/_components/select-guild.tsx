"use client";

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
}: Readonly<{ guilds: { id: string; name: string }[] | undefined }>) {
  const { openModal, isOpen, closeModal, setContent, content } = useModal();

  const [guildId, setGuildId] = useState<string>("");
  const [botAvailable, setBotAvailable] = useState<boolean>(false);
  const [tries, setTries] = useState<number>(0);

  const { mutateAsync, mutate, isPending, data } =
    api.guild.isBotIn.useMutation();

  const maxTries = 3;

  const onInviteClick = useCallback(() => {
    openInviteLink(guildId);
    setContent({
      title: "Invite link generated",
      description:
        "We've opened a new tab with the invite link. If it didn't open try clicking the button again.",
      footer: <Button onClick={onInviteClick}>Invite</Button>,
    });
  }, [content, guildId]);

  async function selectGuild(id: string) {
    const { success, value } = await mutateAsync(id);

    if (!isPending && success && !value) {
      openModal({
        title: "We found a problem",
        description:
          "Looks like the bot is not in this guild. You need to invite it to the guild to continue.",
        footer: <Button onClick={onInviteClick}>Invite</Button>,
      });
    } else if (!success) {
      toast.error("Something went wrong...");
    }

    setBotAvailable(success && value);
    setGuildId(id);
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
    }
    if (tries > 0) {
      setContent({
        ...content,
        title: "Oh no...",
        description:
          "We couldn't detect the bot inside the guild. Try inviting it again.",
        footer: <Button onClick={onInviteClick}>Invite</Button>,
      });
    }
    if (tries >= maxTries) {
      setContent({
        title: "This is akward.",
        description: `We've tried ${tries} times to verify if the bot joined. Maybe try again later.`,
      });
    }
  }, [data, tries, isPending, botAvailable]);

  return (
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
  );
}
