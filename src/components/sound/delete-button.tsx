"use client";

import { Dialog, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
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
  const api = useTRPC();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useMutation(
    api.guild.deleteSound.mutationOptions({
      onSuccess: () => {
        toast("Sound deleted successfully!");
        router.refresh();
        onDeleted?.();
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

  const onDeleteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Sound</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this sound?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={onConfirmDeleteClick}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="destructive" onClick={onDeleteClick} size="icon">
              <Trash />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove Sound from Guild</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
