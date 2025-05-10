import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Step } from "~/components/step";
import { StepsProvider } from "~/context/StepsContext";
import { getServerSession } from "~/lib/auth";
import { EditDetailsStep } from "./_components/steps/edit-details";
import { EditSoundStep } from "./_components/steps/edit-sound";
import { SelectFileStep } from "./_components/steps/select-file";

export const metadata: Metadata = {
  title: "Upload a Sound",
};

export default async function UploadPage() {
  const session = await getServerSession();
  if (!session) return notFound();

  return (
    <StepsProvider>
      <Step>
        <SelectFileStep />
      </Step>
      <Step>
        <EditSoundStep />
      </Step>
      <Step>
        <EditDetailsStep />
      </Step>
    </StepsProvider>
  );
}
