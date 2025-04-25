import { Dialog, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { Button } from "../ui/button";
import { DialogContent, DialogFooter, DialogHeader } from "../ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useRouter } from "next/navigation";

export function DeleteSoundButton({
  discordSoundId,
  guildId,
  onDeleted,
}: Readonly<{
  discordSoundId: string;
  guildId: string;
  onDeleted?: () => void;
}>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = api.guild.deleteSound.useMutation({
    onSuccess: () => {
      toast("Sound deleted successfully!");
      router.refresh();
      onDeleted?.();
    },
    onError: (error) => {
      toast.error("Failed to delete sound.", {
        description: error.message,
      });
    },
    onSettled: () => {
      setOpen(false);
    },
  });

  const onConfirmDeleteClick = () => {
    mutate({ soundId: discordSoundId, guildId: guildId });
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
            <Button
              variant="destructive"
              onClick={() => setOpen(true)}
              size="icon"
            >
              <Trash />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove Sound from Guild</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
}
