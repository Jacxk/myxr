import { Dialog, DialogDescription, DialogTitle } from "@radix-ui/react-dialog";
import { Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { Button } from "../ui/button";
import {
  DialogContent,
  DialogFooter,
  DialogHeader
} from "../ui/dialog";
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
  const { mutate, isSuccess } = api.guild.deleteSound.useMutation();
  const [open, setOpen] = useState(false);

  const onConfirmDeleteClick = () => {
    mutate(
      { soundId: discordSoundId, guildId: guildId },
      {
        onSuccess: () => {
          toast("Sound deleted successfully!");
        },
        onError: (error) => {
          toast.error("Failed to delete sound.", {
            description: error.message,
          });
        },
      },
    );
    setOpen(false);
  };

  useEffect(() => {
    if (isSuccess) {
      toast("Sound deleted");
      onDeleted?.();
    }
  }, [isSuccess]);

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
            <Button variant="destructive" onClick={onConfirmDeleteClick}>
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
