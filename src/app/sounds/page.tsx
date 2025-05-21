import { api } from "~/trpc/server";
import { AllSoundsClient } from "./_components/all-sounds-client";

export default async function SoundsPage() {
  const firstPage = await api.sound.getAllSounds({ cursor: null });

  return <AllSoundsClient initialData={firstPage} />;
}
