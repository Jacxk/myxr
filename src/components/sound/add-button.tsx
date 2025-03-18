import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { useModal } from "~/context/ModalContext";
import { api } from "~/trpc/react";
import { PlusIcon } from "../icons/plus";
import { Button } from "../ui/button";

export function AddToGuildButton({
  soundId,
}: Readonly<{
  soundId: number;
}>) {
  const { mutate, isPending, isSuccess, isError, error } =
    api.guild.createSound.useMutation();
  const router = useRouter();
  const { openModal, closeModal } = useModal();

  function addSoundToGuild(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void {
    event.stopPropagation();
    const guildId = localStorage.getItem("guildId");

    if (!guildId) {
      toast.error("You need to select a guild first!");
      return;
    }

    const onAddClick = () => {
      mutate({ soundId, guildId });
      closeModal();
    };

    openModal({
      title: `Add sound to ${localStorage.getItem("guildName")}`,
      body: "Are you sure you want to add this sound?",
      footer: <Button onClick={onAddClick}>Add</Button>,
    });
  }

  useEffect(() => {
    if (isSuccess) toast("Sound added to guild");
    if (isError) {
      switch (error?.data?.code) {
        case "UNAUTHORIZED":
          router.push("/api/auth/signin");
          break;
        case "INTERNAL_SERVER_ERROR":
          if (error.message === "Unknown Guild") {
            toast.error(
              "This guild is not valid. Is the bot inside the guild?",
              { duration: 5000 },
            );
            break;
          }
          toast.error("There was an interal error!");
          break;
        default:
          toast.error("There was an error!");
      }
    }
  }, [isSuccess, isError]);

  return (
    <Button variant="outline" onClick={addSoundToGuild} disabled={isPending}>
      <PlusIcon />
    </Button>
  );
}
