import React, { createContext, useContext, ReactNode } from "react";
import { Platform } from "react-native";

interface PremiumContextType {
  isPremium: boolean;
  canShare: boolean;
  canGenerateQr: boolean;
  canUseEmbeds: boolean;
  remainingShares: number;
  remainingQrCodes: number;
  isLoading: boolean;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

interface PremiumProviderProps {
  children: ReactNode;
}

export function PremiumProvider({ children }: PremiumProviderProps) {
  return (
    <PremiumContext.Provider
      value={{
        isPremium: false,
        canShare: true,
        canGenerateQr: true,
        canUseEmbeds: false,
        remainingShares: Infinity,
        remainingQrCodes: Infinity,
        isLoading: false,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium(): PremiumContextType {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    return {
      isPremium: false,
      canShare: true,
      canGenerateQr: true,
      canUseEmbeds: false,
      remainingShares: Infinity,
      remainingQrCodes: Infinity,
      isLoading: false,
    };
  }
  return context;
}
