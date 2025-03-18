import { useEffect } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { PlusIcon } from "../icons/plus";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export function AddToGuildButton({
  soundId,
}: Readonly<{
  soundId: number;
}>) {
  const { mutate, isPending, isSuccess, isError, error } =
    api.guild.createSound.useMutation();
  const router = useRouter()

  function addSoundToGuild(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void {
    const guildId = localStorage.getItem("guildId");

    if (!guildId) {
      toast.error("You need to select a guild first!");
      return;
    }

    event.stopPropagation();
    mutate({
      soundId,
      guildId,
    });
  }

  useEffect(() => {
    if (isSuccess) toast("Sound added to guild");
    if (isError) {
      if (error.data?.code === "UNAUTHORIZED") {
        router.push("/api/auth/signin");
      } else toast.error("There was an error!");
    }
  }, [isSuccess, isError]);

  return (
    <Button variant="outline" onClick={addSoundToGuild} disabled={isPending}>
      <PlusIcon />
    </Button>
  );
}
