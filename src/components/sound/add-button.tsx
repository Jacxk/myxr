"use client";

import { DialogTitle } from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useSession } from "~/lib/auth-client";
import { ErrorToast } from "~/lib/messages/toast.global";
import { api } from "~/trpc/react";
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
  isPreview?: boolean;
}

const handleInternalServerError = (message: string): void => {
  switch (message) {
    case "SOUND_EXISTS":
      ErrorToast.soundExistsInGuild()
      break;
    case "Unknown Guild":
      ErrorToast.guildNotFound()
      break;
    case "SOUND_NOT_FOUND":
      ErrorToast.soundNotFound()
      break;
    default:
      ErrorToast.internal(message);
      break;
  }
};

const getGuildFromLocalStorage = ():
  | z.infer<typeof GuildSchema>
  | undefined => {
  const savedGuild = localStorage.getItem("selectedGuild");
  if (!savedGuild) return undefined;

  const parsedGuild = JSON.parse(savedGuild) as typeof GuildSchema;
  const result = GuildSchema.safeParse(parsedGuild);
  return result.success ? result.data : undefined;
};

export function AddToGuildButton({
  soundId,
  isPreview = false,
}: Readonly<AddToGuildButtonProps>) {
  const { data: session } = useSession();

  const { mutate, isPending } = api.guild.createSound.useMutation({
    onSuccess: () => {
      toast("Sound added to guild");
      setOpen(false);
    },
    onError: (error) => {
      if (error?.data?.code === "UNAUTHORIZED") {
        ErrorToast.login();
      } else if (error?.data?.code === "INTERNAL_SERVER_ERROR") {
        handleInternalServerError(error.message);
      } else {
        ErrorToast.internal()
      }
    },
  });

  const [open, setOpen] = useState<boolean>(false);

  const onAddClick = useCallback((): void => {
    if (!session) {
      ErrorToast.login();
      return;
    }

    const guild = getGuildFromLocalStorage();
    if (!guild) {
      ErrorToast.selectGuild();
      return;
    }
    mutate({ soundId, guildId: guild.id, guildName: guild.name });
  }, [mutate, soundId, session]);

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

      const guild = getGuildFromLocalStorage();
      if (!guild) {
        ErrorToast.selectGuild();
        return;
      }

      setOpen(true);
    },
    [isPreview, session],
  );

  return (
    <>
      {/* Dialog for confirming the addition of a sound */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{`Add sound to ${getGuildFromLocalStorage()?.name}`}</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to add this sound?</p>
          <DialogFooter>
            <Button onClick={onAddClick} disabled={isPending}>
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
              size="icon"
              onClick={addSoundToGuild}
              disabled={isPending}
            >
              <Plus />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add Sound to Guild</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
