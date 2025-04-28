import { api } from "~/trpc/server";
import { AllSoundsClient } from "./all-sounds-client";

export async function AllSounds() {
  const firstPage = await api.sound.getAllSounds({ cursor: null });

  return <AllSoundsClient initialData={firstPage} />;
}
