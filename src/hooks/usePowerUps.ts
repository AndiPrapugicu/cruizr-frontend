import { useContext } from "react";
import { PowerUpContext } from "../contexts/PowerUpContext";

export const usePowerUps = () => {
  const context = useContext(PowerUpContext);
  if (!context) {
    throw new Error("usePowerUps must be used within a PowerUpProvider");
  }
  return context;
};
