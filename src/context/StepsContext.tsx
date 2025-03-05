"use client";

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
import { StepProps } from "~/components/step";

interface StepsContextProps<D = unknown> {
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

const StepsContext = createContext<StepsContextProps<any> | undefined>(
  undefined,
);

export const StepsProvider = <D,>({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [data, setData] = useState<D>({} as D);

  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;

  function reset() {
    setTimeout(() => {
      setCurrentStep(1);
      setData({} as D);
    }, 100);
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
    [currentStep, data],
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

export function useSteps<D>(): StepsContextProps<D> {
  const context = useContext(StepsContext);
  if (!context) {
    throw new Error("useSteps must be used within an StepsProvider");
  }
  return context;
}
