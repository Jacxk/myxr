import { StepsProvider } from "~/context/StepsContext";
import { EditDetailsStep } from "./_components/steps/edit-details";
import { SelectFileStep } from "./_components/steps/select-file";
import { Step } from "./_components/steps/step";
import { auth } from "~/server/auth";
import { Session } from "next-auth";

export default async function Home() {
  const session: Session | null = await auth();
  
  delete session?.user.email;

  return (
    <main className="flex h-full flex-col items-center justify-between">
      <StepsProvider>
        <Step>
          <SelectFileStep />
        </Step>
        <Step>
          <EditDetailsStep session={session} />
        </Step>
      </StepsProvider>
    </main>
  );
}
