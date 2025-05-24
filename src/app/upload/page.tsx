import type { Metadata } from "next";
import { unauthorized } from "next/navigation";
import { Main } from "~/components/main";
import { Step } from "~/components/step";
import { StepsProvider } from "~/context/StepsContext";
import { getServerSession } from "~/lib/auth";
import { EditDetailsStep } from "./_components/steps/edit-details";
import { EditSoundStep } from "./_components/steps/edit-sound";
import { SelectFileStep } from "./_components/steps/select-file";
import { UploadNavigationGuard } from "./_components/upload-navigation-guard";

export const metadata: Metadata = {
  title: "Upload a Sound",
};

export default async function UploadPage() {
  const session = await getServerSession();
  if (!session) return unauthorized();

  return (
    <Main>
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
        <UploadNavigationGuard />
      </StepsProvider>
    </Main>
  );
}
