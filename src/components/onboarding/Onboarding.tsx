import React from "react";
import { AnimatePresence } from "framer-motion";
import { OnboardingProvider } from "./OnboardingContext";
import { useOnboarding } from "./useOnboarding";
import Step1FirstName from "./Step1FirstName";
import Step2Birthday from "./Step2Birthday";
import Step3Gender from "./Step3Gender";
import Step4Interests from "./Step4Interests";
import CarOnboardingStep from "./CarOnboardingStep";
import Step5Photos from "./Step5Photos";
import Step6Bio from "./Step6Bio";
import Step7Complete from "./Step7Complete";

const OnboardingSteps: React.FC = () => {
  const { currentStep } = useOnboarding();

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1FirstName key="step1" />;
      case 2:
        return <Step2Birthday key="step2" />;
      case 3:
        return <Step3Gender key="step3" />;
      case 4:
        return <Step4Interests key="step4" />;
      case 5:
        return <CarOnboardingStep key="step5" />; // Cars step
      case 6:
        return <Step6Bio key="step6" />; // Bio
      case 7:
        return <Step5Photos key="step7" />; // Photos
      case 8:
        return <Step7Complete key="step8" />;
      default:
        return <Step1FirstName key="step1" />;
    }
  };

  return <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>;
};

const Onboarding: React.FC = () => {
  return (
    <OnboardingProvider>
      <div className="min-h-screen">
        <OnboardingSteps />
      </div>
    </OnboardingProvider>
  );
};

export default Onboarding;
