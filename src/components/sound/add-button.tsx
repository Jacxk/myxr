"use client";

import { DialogTitle } from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { usePostHog } from "posthog-js/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useSession } from "~/lib/auth-client";
import { ErrorToast } from "~/lib/messages/toast.global";
import { useTRPC } from "~/trpc/react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "../ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const GuildSchema = z.object({
  id: z.string().nonempty("Guild ID is required"),
  name: z.string().nonempty("Guild name is required"),
});

interface AddToGuildButtonProps {
  soundId: string;
  usage?: number;
  isPreview?: boolean;
}

const handleInternalServerError = (message: string): void => {
  switch (message) {
    case "SOUND_EXISTS":
      ErrorToast.soundExistsInGuild();
      break;
    case "Unknown Guild":
      ErrorToast.guildNotFound();
      break;
    case "SOUND_NOT_FOUND":
      ErrorToast.soundNotFound();
      break;
    default:
      ErrorToast.internal(message);
      break;
  }
};

export function AddToGuildButton({
  soundId,
  usage,
  isPreview = false,
}: Readonly<AddToGuildButtonProps>) {
  const api = useTRPC();
  const { data: session } = useSession();
  const posthog = usePostHog();

  const [open, setOpen] = useState<boolean>(false);
  const [usageCount, setUsageCount] = useState(usage ?? 0);
  const [guild, setGuild] = useState<z.infer<typeof GuildSchema> | undefined>();

  const { mutate, isPending } = useMutation(
    api.guild.createSound.mutationOptions({
      onSuccess: (_, variables) => {
        posthog.capture("Sound added to guild", {
          soundId: variables.soundId,
          guildId: variables.guildId,
        });

        toast("Sound added to guild");
        setOpen(false);
      },
      onError: (error) => {
        if (error?.data?.code === "UNAUTHORIZED") {
          ErrorToast.login();
        } else if (error?.data?.code === "INTERNAL_SERVER_ERROR") {
          handleInternalServerError(error.message);
        }

        setUsageCount((usage) => usage - 1);
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
  }, [mutate, soundId, session, guild]);

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

      const savedGuild = localStorage.getItem("selectedGuild");
      if (savedGuild) {
        const parsedGuild = JSON.parse(savedGuild) as typeof GuildSchema;
        const result = GuildSchema.safeParse(parsedGuild);
        if (result.success) {
          setGuild(result.data);
          setOpen(true);
          return;
        }
      }
      ErrorToast.selectGuild();
    },
    [isPreview, session],
  );

  return (
    <>
      {/* Dialog for confirming the addition of a sound */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{`Add sound to ${guild?.name}`}</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to add this sound?</p>
          <DialogFooter>
            <Button
              onClick={onAddClick}
              disabled={isPending}
              loading={isPending}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tooltip and button for adding a sound */}
      <TooltipProvider delayDuration={0}>
        <Tooltip disableHoverableContent>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={addSoundToGuild}
              disabled={isPending}
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
