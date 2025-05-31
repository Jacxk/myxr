"use client";

import { DialogTitle } from "@radix-ui/react-dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { type Snowflake } from "discord-api-types/v10";
import { Check, Loader2, Plus, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
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
  canManage: boolean;
  hasRole: boolean;
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
    case "NO_MANAGE_PERMISSION":
      toast.error(
        "You need to have a sound master role to add sounds to this guild.",
      );
      break;
  }
};

function GuildSelect({
  onSelectGuild,
}: {
  onSelectGuild: (guild?: Guild) => void;
}) {
  const api = useTRPC();

  const {
    data: guilds,
    isFetching,
    isLoading,
    refetch,
    isRefetching,
    dataUpdatedAt,
  } = useQuery(api.guild.getAvailableGuilds.queryOptions());

  const [selectedGuild, setSelectedGuild] = useState<Guild>();
  const [invitedGuildId, setInvitedGuildId] = useState<string>();

  const availableGuilds = guilds?.available ?? [];
  const unavailableGuilds = guilds?.unavailable ?? [];

  const isWaitingForJoin = (guildId: string) =>
    invitedGuildId === guildId && (isFetching || isRefetching);

  const hasBotJoined = useMemo(
    () => (guildId: string) =>
      invitedGuildId === guildId &&
      !isFetching &&
      guilds?.available.some((guild) => guild.id === guildId),
    [invitedGuildId, isFetching, guilds],
  );

  const onSelect = (guild: Guild, available = false) => {
    if (!available) {
      if (!guild.canManage) {
        toast.error(
          "You need management permissions to invite the bot to this guild.",
        );
        return;
      }
      toast.error("You need to invite the bot to this guild first.");
      return;
    }

    if (!guild.canManage && !guild.hasRole) {
      toast.error(
        "You need to have a sound master role to add sounds to this guild.",
      );
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
    if (!guilds) return;

    const savedGuild = localStorage.getItem("selectedGuild");
    const selectedGuild = guilds.available.find(
      (guild) => guild.id === savedGuild,
    );

    if (selectedGuild && !selectedGuild.canManage && !selectedGuild.hasRole) {
      setSelectedGuild(undefined);
      onSelectGuild(undefined);
      return;
    }
    if (selectedGuild) {
      setSelectedGuild(selectedGuild);
      onSelectGuild(selectedGuild);
    }
  }, [guilds, dataUpdatedAt, onSelectGuild]);

  useEffect(() => {
    if (!invitedGuildId) return;

    const checkBotJoined = () => {
      refetch()
        .then(() => {
          if (hasBotJoined(invitedGuildId)) {
            toast.success("Bot has joined the guild!");
          }
        })
        .catch(() => ErrorToast.internal())
        .finally(() => setInvitedGuildId(undefined));
    };

    window.addEventListener("focus", checkBotJoined);
    return () => {
      window.removeEventListener("focus", checkBotJoined);
    };
  }, [invitedGuildId, hasBotJoined, refetch]);

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
    <>
      <div className="flex items-center justify-end gap-2">
        <TooltipProvider>
          <Tooltip disableHoverableContent>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                loading={isRefetching}
                onClick={() => refetch()}
              >
                <RefreshCcw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh Guilds</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
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
              availableGuilds.length === 0 && (
                <CommandItem disabled>
                  No available guilds. Invite the bot to one.
                </CommandItem>
              )
            )}
            {availableGuilds.map((guild) => (
              <CommandItem
                key={guild.id}
                onSelect={() => onSelect(guild, true)}
              >
                <Avatar>
                  <AvatarImage
                    src={guild.image ?? undefined}
                    alt={guild.name}
                  />
                  <AvatarFallback className="flex items-center justify-center text-xs">
                    {guild.name.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{guild.name}</span>
                <CommandShortcut>
                  {selectedGuild?.id === guild.id ? (
                    <Check />
                  ) : !guild.canManage && !guild.hasRole ? (
                    <span className="text-muted-foreground">
                      No Permissions
                    </span>
                  ) : null}
                </CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Unavailable Guilds">
            {unavailableGuilds.map((guild) => (
              <CommandItem key={guild.id} onSelect={() => onSelect(guild)}>
                <Avatar>
                  <AvatarImage
                    src={guild.image ?? undefined}
                    alt={guild.name}
                  />
                  <AvatarFallback className="flex items-center justify-center text-xs">
                    {guild.name.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{guild.name}</span>

                <CommandShortcut>
                  {guild.canManage ? (
                    <Button
                      size="sm"
                      onClick={(event) => onInviteClick(event, guild.id)}
                      disabled={isWaitingForJoin(guild.id)}
                    >
                      {isWaitingForJoin(guild.id) ? "Waiting..." : "Invite"}
                    </Button>
                  ) : (
                    <span className="text-muted-foreground">Cannot Invite</span>
                  )}
                </CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </>
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
  const router = useRouter();

  const [open, setOpen] = useState<boolean>(false);
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
      },
      onSettled: () => {
        setOpen(false);
        router.refresh();
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
                }).format(usage)}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add Sound to Guild</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
