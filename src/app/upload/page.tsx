import { Session } from "next-auth";
import { StepsProvider } from "~/context/StepsContext";
import { auth } from "~/server/auth";
import { EditDetailsStep } from "./_components/steps/edit-details";
import { EditSoundStep } from "./_components/steps/edit-sound";
import { SelectFileStep } from "./_components/steps/select-file";
import { Step } from "./_components/steps/step";

export default async function Home() {
  const session: Session | null = await auth();

  return (
    <StepsProvider>
      <Step>
        <SelectFileStep />
      </Step>
      <Step>
        <EditSoundStep />
      </Step>
      <Step>
        <EditDetailsStep session={session} />
      </Step>
    </StepsProvider>
  );
}
