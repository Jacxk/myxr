"use client";

import { useSteps } from "~/context/StepsContext";
import { useNavigationWarning } from "~/lib/useNavigationWarning";

export function UploadNavigationGuard() {
  const { currentStep } = useSteps();

  const { Dialog } = useNavigationWarning({ shouldWarn: currentStep > 1 });

  return <>{Dialog}</>;
}
