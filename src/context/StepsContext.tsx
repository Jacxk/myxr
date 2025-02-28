"use client"

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { StepProps } from "~/app/upload/_components/steps/step";

interface StepsContextProps {
  currentStep: number;
  files: File[];
  totalSteps: number;
  setCurrentStep: (step: number) => void;
  setFiles: (files: File[]) => void;
  reset: () => void;
  registerStep: () => number;
  nextStep: () => void;
  prevStep: () => void;
}

const StepsContext = createContext<StepsContextProps | undefined>(
  undefined,
);

export const StepsProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [files, setFiles] = useState<File[]>([]);

  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;

  function reset() {
    setCurrentStep(1);
    setFiles([]);
  }
  const registerStep = () => ++stepCounter;
  const nextStep = () => setCurrentStep((currentStep) => currentStep + 1);
  const prevStep = () => setCurrentStep((currentStep) => currentStep - 1);

  const value = useMemo(
    () => ({
      currentStep,
      files,
      totalSteps,
      setCurrentStep,
      setFiles,
      reset,
      registerStep,
      nextStep,
      prevStep,
    }),
    [currentStep, files],
  );

  let stepCounter = 0;

  return (
    <StepsContext.Provider value={value}>
      {stepsArray.map((child, index) => {
        if (isValidElement(child)) {
          return cloneElement(child, { step: index + 1 } as StepProps);
        }
        return child;
      })}
    </StepsContext.Provider>
  );
};

export const useSteps = (): StepsContextProps => {
  const context = useContext(StepsContext);
  if (!context) {
    throw new Error(
      "useSteps must be used within an StepsProvider",
    );
  }
  return context;
};
