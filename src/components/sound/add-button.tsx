"use client";

import { DialogTitle } from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { z } from "zod";

const GuildSchema = z.object({
  id: z.string().nonempty("Guild ID is required"),
  name: z.string().nonempty("Guild name is required"),
});

export function AddToGuildButton({
  soundId,
  isPreview,
}: Readonly<{
  soundId: string;
  isPreview?: boolean;
}>) {
  const { mutate, isPending, isSuccess, isError, error } =
    api.guild.createSound.useMutation();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const validateGuild = () => {
    const guildData = {
      id: localStorage.getItem("guildId"),
      name: localStorage.getItem("guildName"),
    };
    const result = GuildSchema.safeParse(guildData);

    if (!result.success) {
      toast.error("You need to select a guild first");
      return null;
    }

    return result.data;
  };

  const onAddClick = () => {
    const data = validateGuild();
    if (!data) return;

    mutate({ soundId, guildId: data.id, guildName: data.name });
    setOpen(false);
  };

  function addSoundToGuild(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void {
    event.stopPropagation();

    if (isPreview) {
      toast("Preview Mode: Sound added to guild");
      return;
    }

    const data = validateGuild();
    if (!data) return;

    setOpen(true);
  }

  useEffect(() => {
    if (isSuccess) toast("Sound added to guild");
    if (isError) {
      if (error?.data?.code === "UNAUTHORIZED") {
        router.push("/api/auth/signin");
      } else if (error?.data?.code === "INTERNAL_SERVER_ERROR") {
        switch (error.message) {
          case "SOUND_EXISTS":
            toast.error("Sound already exists in the guild");
            break;
          case "Unknown Guild":
            toast.error(
              "This guild is not valid. Is the bot inside the guild?",
              { duration: 5000 },
            );
            break;
          case "SOUND_NOT_FOUND":
            toast.error("Sound not found. Try again later.");
            break;
          default:
            toast.error("There was an error!", {
              duration: 5000,
              description: error.message,
            });
            break;
        }
      } else toast.error("There was an internal error!");
    }
  }, [isSuccess, isError]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{`Add sound to ${localStorage.getItem("guildName")}`}</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to add this sound?</p>
          <DialogFooter>
            <Button onClick={onAddClick}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
