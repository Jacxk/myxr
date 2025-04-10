import { Step } from "~/components/step";
import { Button } from "~/components/ui/button";
import { StepsProvider } from "~/context/StepsContext";
import { auth } from "~/server/auth";
import { EditDetailsStep } from "./_components/steps/edit-details";
import { EditSoundStep } from "./_components/steps/edit-sound";
import { SelectFileStep } from "./_components/steps/select-file";
import { SessionProvider } from "next-auth/react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload a Sound - Myxr",
};

export default async function () {
  const session = await auth();

  if (!session || !session.user) {
    return <Button>Sign In</Button>;
  }

  return (
    <SessionProvider>
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
    </SessionProvider>
  );
}
