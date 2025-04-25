"use client";

import { DialogTitle } from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
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
      toast.error("Sound already exists in the guild");
      break;
    case "Unknown Guild":
      toast.error("This guild is not valid. Is the bot inside the guild?", {
        duration: 5000,
      });
      break;
    case "SOUND_NOT_FOUND":
      toast.error("Sound not found. Try again later.");
      break;
    default:
      toast.error("There was an error!", {
        duration: 5000,
        description: message,
      });
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
  const router = useRouter();

  const { mutate, isPending } = api.guild.createSound.useMutation({
    onSuccess: () => {
      toast("Sound added to guild");
      setOpen(false);
    },
    onError: (error) => {
      if (error?.data?.code === "UNAUTHORIZED") {
        router.push("/api/auth/signin");
      } else if (error?.data?.code === "INTERNAL_SERVER_ERROR") {
        handleInternalServerError(error.message);
      } else {
        toast.error("There was an internal error!");
      }
    },
  });

  const [open, setOpen] = useState<boolean>(false);

  const onAddClick = useCallback((): void => {
    const guild = getGuildFromLocalStorage();
    if (!guild) {
      toast.error("You need to select a guild first");
      return;
    }
    mutate({ soundId, guildId: guild.id, guildName: guild.name });
  }, [mutate, soundId]);

  const addSoundToGuild = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>): void => {
      event.stopPropagation();

      if (isPreview) {
        toast("Preview Mode: Sound added to guild");
        return;
      }

      const guild = getGuildFromLocalStorage();
      if (!guild) {
        toast.error("You need to select a guild first");
        return;
      }

      setOpen(true);
    },
    [isPreview],
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
