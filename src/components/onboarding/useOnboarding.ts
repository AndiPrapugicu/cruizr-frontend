import { useContext } from "react";
import { OnboardingContext } from "./OnboardingContext";

export const useOnboarding = () => useContext(OnboardingContext);
