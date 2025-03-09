import { useEffect } from "react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { PlusIcon } from "../icons/plus";
import { Button } from "../ui/button";

export function AddToGuildButton({
  guildId,
  soundId,
}: Readonly<{
  guildId: string;
  soundId: number;
}>) {
  const { mutate, isPending, isSuccess, isError } =
    api.guild.createSound.useMutation();

  function addSoundToGuild(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void {
    event.stopPropagation();
    mutate({
      soundId,
      guildId,
    });
  }

  useEffect(() => {
    if (isSuccess) toast("Sound added to guild");
    if (isError) toast.error("There was an error!");
  }, [isSuccess, isError]);

  return (
    <Button variant="outline" onClick={addSoundToGuild} disabled={isPending}>
      <PlusIcon />
    </Button>
  );
}
