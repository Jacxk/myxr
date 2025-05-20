"use client";

import { Dialog, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { type MouseEvent, useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "~/trpc/react";
import { Button } from "../ui/button";
import { DialogContent, DialogFooter, DialogHeader } from "../ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

export function DeleteSoundButton({
  discordSoundId,
  guildId,
  onDeleted,
}: Readonly<{
  discordSoundId: string;
  guildId: string;
  onDeleted?: () => void;
}>) {
  const posthog = usePostHog();
  const api = useTRPC();
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const { mutate, isPending } = useMutation(
    api.guild.deleteSound.mutationOptions({
      onSuccess: (_, variables) => {
        posthog.capture("Sound removed from guild", {
          soundId: variables.soundId,
          guildId: variables.guildId,
        });

        toast("Sound deleted successfully!");
        onDeleted?.();
        router.refresh();
      },
      onSettled: () => {
        setOpen(false);
      },
    }),
  );

  const onConfirmDeleteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    mutate({ soundId: discordSoundId, guildId: guildId });
  };

  const onRemoveClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Sound From Guild</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this sound from the guild?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={onConfirmDeleteClick}
              loading={isPending}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="destructive" onClick={onRemoveClick} size="icon">
              <Trash />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove Sound from Guild</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
