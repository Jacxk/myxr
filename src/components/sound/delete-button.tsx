import { useEffect } from "react";
import { toast } from "sonner";
import { useModal } from "~/context/ModalContext";
import { api } from "~/trpc/react";
import { Button } from "../ui/button";

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
      mutate({
        soundId: discordSoundId,
        guildId,
      });
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
    <Button variant="destructive" onClick={onDeleteClickButton}>
      Delete
    </Button>
  );
}
