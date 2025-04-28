"use client";

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { type StepProps } from "~/components/step";

interface StepsContextProps<D> {
  currentStep: number;
  data: D;
  totalSteps: number;
  setCurrentStep: (step: number) => void;
  setData: (data: D) => void;
  reset: () => void;
  registerStep: () => number;
  nextStep: () => void;
  prevStep: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StepsContext = createContext<StepsContextProps<any> | undefined>(
  undefined,
);

export const StepsProvider = <D,>({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [data, setData] = useState<D>({} as D);

  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  let stepCounter = 0;

  function reset() {
    setCurrentStep(1);
    setData({} as D);
  }
  const registerStep = () => ++stepCounter;
  const nextStep = () => setCurrentStep((currentStep) => currentStep + 1);
  const prevStep = () => setCurrentStep((currentStep) => currentStep - 1);

  const value: StepsContextProps<D> = useMemo(
    () => ({
      currentStep,
      data,
      totalSteps,
      setCurrentStep,
      setData,
      reset,
      registerStep,
      nextStep,
      prevStep,
    }),
    [currentStep, data, totalSteps],
  );

  return (
    <StepsContext value={value}>
      {stepsArray.map((child, index) => {
        if (isValidElement(child)) {
          return cloneElement(child, { step: index + 1 } as StepProps);
        }
        return child;
      })}
    </StepsContext>
  );
};

export function useSteps<D>() {
  const context = useContext(StepsContext);
  if (!context) {
    throw new Error("useSteps must be used within an StepsProvider");
  }
  return context as StepsContextProps<D>;
}
