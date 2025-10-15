import React, { createContext, useContext, useState } from "react";

export interface CarData {
  brand: string;
  model: string;
  year: number;
  color?: string;
  engineSize?: string;
  bodyType?: string;
  horsepower?: number;
  torque?: number;
  fuelType?: string;
  transmission?: string;
  drivetrain?: string;
  mileage?: number;
  upholsteryType?: string;
  interiorColor?: string;
  doors?: number;
  seats?: number;
  hasSunroof?: boolean;
  mods: string[];
  isPrimary: boolean;
  photos: string[];
  garageTourVideo?: string;
}

export interface OnboardingData {
  firstName: string;
  birthday: Date | null;
  gender: "male" | "female" | null;
  interests: string[];
  cars: CarData[];
  photos: File[];
  agreed: boolean;
  bio?: string;
}

const defaultData: OnboardingData = {
  firstName: "",
  birthday: null,
  gender: null,
  interests: [],
  cars: [],
  photos: [],
  agreed: false,
  bio: "",
};

interface OnboardingContextType {
  data: OnboardingData;
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  totalSteps: number;
}

const OnboardingContext = createContext<OnboardingContextType>({
  data: defaultData,
  setData: () => {},
  currentStep: 1,
  setCurrentStep: () => {},
  totalSteps: 7,
});

export { OnboardingContext };

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8; // 1: Name, 2: Birthday, 3: Gender, 4: Interests, 5: Cars, 6: Bio, 7: Photos, 8: Complete

  return (
    <OnboardingContext.Provider
      value={{ data, setData, currentStep, setCurrentStep, totalSteps }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};
