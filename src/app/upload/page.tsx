import { Metadata } from "next";
import { Step } from "~/components/step";
import { StepsProvider } from "~/context/StepsContext";
import { EditDetailsStep } from "./_components/steps/edit-details";
import { EditSoundStep } from "./_components/steps/edit-sound";
import { SelectFileStep } from "./_components/steps/select-file";

export const metadata: Metadata = {
  title: "Upload a Sound - Myxr",
};

export default async function () {
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
