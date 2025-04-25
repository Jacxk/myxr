import { Metadata } from "next";
import { Step } from "~/components/step";
import { StepsProvider } from "~/context/StepsContext";
import { EditDetailsStep } from "./_components/steps/edit-details";
import { EditSoundStep } from "./_components/steps/edit-sound";
import { SelectFileStep } from "./_components/steps/select-file";
import { getServerSession } from "~/lib/auth";

export const metadata: Metadata = {
  title: "Upload a Sound - Myxr",
};

export default async function () {
  const session = await getServerSession();

  return (
    <StepsProvider>
      <Step>
        <SelectFileStep user={session?.user} />
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
