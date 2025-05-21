"use client";

import { DialogTitle } from "@radix-ui/react-dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { type Snowflake } from "discord-api-types/v10";
import { Check, Loader2, Plus } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { type Guild } from "~/app/sounds/[id]/_components/guild";
import { useSession } from "~/lib/auth-client";
import { ErrorToast } from "~/lib/messages/toast.global";
import { useTRPC } from "~/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "../ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from "../ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

type Guild = {
  id: Snowflake;
  name: string;
  image: string | null;
  available: boolean;
};

interface AddToGuildButtonProps {
  soundId: string;
  soundName: string;
  usage?: number;
  isPreview?: boolean;
}

function generateBotInvite(guildId: string) {
  return `https://discord.com/oauth2/authorize?client_id=1293222273473318952&guild_id=${guildId}&disable_guild_select=true`;
}

const handleInternalServerError = (message: string): void => {
  switch (message) {
    case "SOUND_EXISTS":
      ErrorToast.soundExistsInGuild();
      break;
    case "Unknown Guild":
    case "Unknown Member":
      ErrorToast.guildNotFound();
      break;
    case "SOUND_NOT_FOUND":
      ErrorToast.soundNotFound();
      break;
  }
};

function GuildSelect({
  onSelectGuild,
}: {
  onSelectGuild: (guild?: Guild) => void;
}) {
  const { data: session } = useSession();
  const inputGuilds =
    session?.user.guilds.map((guild) => ({
      id: guild.id,
      name: guild.name,
      image: guild.image,
    })) ?? [];

  const api = useTRPC();
  const {
    data: guilds,
    isFetching,
    isLoading,
    refetch,
  } = useQuery(api.guild.getAvailableGuilds.queryOptions(inputGuilds));

  const [selectedGuild, setSelectedGuild] = useState<Guild>();
  const [invitedGuildId, setInvitedGuildId] = useState<string>();

  const availableGuilds = guilds?.filter((guild) => guild.available);
  const unavailableGuilds = guilds?.filter((guild) => !guild.available);

  const isWaitingForJoin = (guildId: string) =>
    invitedGuildId === guildId && isFetching;
  const hasBotJoined = useMemo(
    () => (guildId: string) =>
      invitedGuildId === guildId &&
      !isFetching &&
      guilds?.some((guild) => guild.id === guildId && guild.available),
    [invitedGuildId, isFetching, guilds],
  );

  const onSelect = (guild: Guild) => {
    if (!guild.available) {
      toast.error("You need to invite the bot to this guild first.");
      return;
    }
    localStorage.setItem("selectedGuild", guild.id);
    setSelectedGuild(guild);
    onSelectGuild(guild);
  };

  const onInviteClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    guildId: string,
  ) => {
    event.stopPropagation();

    const inviteLink = generateBotInvite(guildId);
    window.open(inviteLink, "_blank", "noopener,noreferrer");

    setInvitedGuildId(guildId);
  };

  useEffect(() => {
    const savedGuild = localStorage.getItem("selectedGuild");
    const selectedGuild = guilds?.find((guild) => guild.id === savedGuild);

    setSelectedGuild(selectedGuild);
    onSelectGuild(selectedGuild);

    void refetch();
  }, [guilds, refetch, onSelectGuild]);

  useEffect(() => {
    if (!invitedGuildId) return;

    const checkBotJoined = () => {
      void refetch();
      if (hasBotJoined(invitedGuildId)) {
        toast.success("Bot has joined the guild!");
        setInvitedGuildId(undefined);
      }
    };

    window.addEventListener("focus", checkBotJoined);
    return () => {
      window.removeEventListener("focus", checkBotJoined);
    };
  }, [invitedGuildId, guilds, isFetching, hasBotJoined, refetch]);

  if (isLoading)
    return (
      <Command className="max-h-100 overflow-y-auto rounded-lg border shadow-md md:min-w-[450px]">
        <CommandInput placeholder="Search for a guild..." disabled />
        <CommandList>
          <CommandItem disabled>
            <Loader2 className="size-4 animate-spin" />
            Loading guilds...
          </CommandItem>
        </CommandList>
      </Command>
    );

  return (
    <Command className="max-h-100 overflow-y-auto rounded-lg border shadow-md md:min-w-[450px]">
      <CommandInput placeholder="Search for a guild..." />
      <CommandList>
        <CommandEmpty>No guilds found.</CommandEmpty>
        <CommandGroup heading="Available Guilds">
          {!guilds ? (
            <CommandItem disabled>
              It looks like you&apos;re not in a guild you can manage.
            </CommandItem>
          ) : (
            guilds.length === 0 && (
              <CommandItem disabled>
                No available guilds. Invite the bot to one.
              </CommandItem>
            )
          )}
          {availableGuilds?.map((guild) => (
            <CommandItem key={guild.id} onSelect={() => onSelect(guild)}>
              <Avatar>
                <AvatarImage src={guild.image ?? undefined} alt={guild.name} />
                <AvatarFallback className="flex items-center justify-center text-xs">
                  {guild.name.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{guild.name}</span>
              <CommandShortcut>
                {selectedGuild?.id === guild.id && <Check />}
              </CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Unavailable Guilds">
          {unavailableGuilds?.map((guild) => (
            <CommandItem key={guild.id} onSelect={() => onSelect(guild)}>
              <Avatar>
                <AvatarImage src={guild.image ?? undefined} alt={guild.name} />
                <AvatarFallback className="flex items-center justify-center text-xs">
                  {guild.name.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{guild.name}</span>

              <CommandShortcut>
                <Button
                  size="sm"
                  onClick={(event) => onInviteClick(event, guild.id)}
                  disabled={isWaitingForJoin(guild.id)}
                >
                  {isWaitingForJoin(guild.id) ? "Waiting..." : "Invite"}
                </Button>
              </CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export function AddToGuildButton({
  soundId,
  soundName,
  usage,
  isPreview = false,
}: Readonly<AddToGuildButtonProps>) {
  const { data: session } = useSession();
  const api = useTRPC();
  const posthog = usePostHog();

  const [open, setOpen] = useState<boolean>(false);
  const [usageCount, setUsageCount] = useState(usage ?? 0);
  const [guild, setGuild] = useState<Guild>();

  const { mutate, isPending } = useMutation(
    api.guild.createSound.mutationOptions({
      onSuccess: (_, variables) => {
        posthog.capture("Sound added to guild", {
          soundId: variables.soundId,
          guildId: variables.guildId,
        });

        toast("Sound added to guild");
      },
      onError: (error) => {
        handleInternalServerError(error.message);
        setUsageCount((usage) => usage - 1);
      },
      onSettled: () => {
        setOpen(false);
      },
    }),
  );

  const onAddClick = useCallback((): void => {
    if (!session) {
      ErrorToast.login();
      return;
    }

    if (!guild) {
      ErrorToast.selectGuild();
      return;
    }

    setUsageCount((usage) => usage + 1);
    mutate({ soundId, guildId: guild.id, guildName: guild.name });
  }, [mutate, soundId, guild, session]);

  const addSoundToGuild = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>): void => {
      event.stopPropagation();
      if (!session) {
        ErrorToast.login();
        return;
      }

      if (isPreview) {
        toast("Preview Mode: Sound added to guild");
        return;
      }

      setOpen(true);
    },
    [isPreview, session],
  );

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Sound To Guild</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Which guild you want to add{" "}
            <span className="font-semibold">&quot;{soundName}&quot;</span>
            <br />
            Current guild selected:{" "}
            <span className="font-semibold">&quot;{guild?.name}&quot;</span>
          </DialogDescription>
          <GuildSelect onSelectGuild={setGuild} />
          <DialogFooter>
            <Button onClick={onAddClick} loading={isPending}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TooltipProvider delayDuration={0}>
        <Tooltip disableHoverableContent>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={addSoundToGuild}
              loading={isPending}
              size={typeof usage === "number" ? "default" : "icon"}
            >
              <Plus />
              {usage &&
                Intl.NumberFormat(navigator.language, {
                  notation: "compact",
                }).format(usageCount)}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add Sound to Guild</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
