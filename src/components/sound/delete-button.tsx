import { Trash } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useModal } from "~/context/ModalContext";
import { api } from "~/trpc/react";
import { Button } from "../ui/button";
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
  const { openModal, closeModal } = useModal();

  const onDeleteClickButton = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    const onDeleteClick = () => {
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
      closeModal();
    };

    openModal({
      title: `Delete Sound`,
      body: "Are you sure you want to delete this sound?",
      footer: (
        <Button onClick={onDeleteClick} variant="destructive">
          Delete
        </Button>
      ),
    });
  };

  useEffect(() => {
    if (isSuccess) {
      toast("Sound deleted");
      onDeleted?.();
    }
  }, [isSuccess]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="destructive"
            onClick={onDeleteClickButton}
            size="icon"
          >
            <Trash />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Remove Sound from Guild</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
