"use client"

import { ReactNode } from "react";
import { useSteps } from "~/context/StepsContext";

export interface StepProps {
  step?: number;
  children: ReactNode;
}

export function Step({ step, children }: Readonly<StepProps>) {
  const { currentStep } = useSteps();
  if (currentStep !== step) return null;
  return children;
}
