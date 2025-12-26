import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { Alert, Linking, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { PaywallType } from "@/components/PaywallModal";

const WEEKLY_LIMIT = 5;

interface PremiumState {
  isPremium: boolean;
  weeklyShareCount: number;
  weeklyQrCount: number;
  weeklyResetAt: string | null;
}

interface PremiumContextType {
  isPremium: boolean;
  weeklyShareCount: number;
  weeklyQrCount: number;
  canShare: boolean;
  canGenerateQr: boolean;
  canUseEmbeds: boolean;
  remainingShares: number;
  remainingQrCodes: number;
  paywallVisible: boolean;
  paywallType: PaywallType;
  showPaywall: (type: PaywallType) => void;
  hidePaywall: () => void;
  checkAndIncrementShare: () => boolean;
  checkAndIncrementQr: () => boolean;
  checkEmbedAccess: () => boolean;
  handleUpgrade: () => void;
  updatePremiumState: (state: Partial<PremiumState>) => void;
  refreshUsage: () => void;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

interface PremiumProviderProps {
  children: ReactNode;
  initialState?: Partial<PremiumState>;
}

export function PremiumProvider({ children, initialState }: PremiumProviderProps) {
  const [isPremium, setIsPremium] = useState(initialState?.isPremium ?? false);
  const [weeklyShareCount, setWeeklyShareCount] = useState(initialState?.weeklyShareCount ?? 0);
  const [weeklyQrCount, setWeeklyQrCount] = useState(initialState?.weeklyQrCount ?? 0);
  const [weeklyResetAt, setWeeklyResetAt] = useState<string | null>(initialState?.weeklyResetAt ?? null);
  
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [paywallType, setPaywallType] = useState<PaywallType>("soft_upsell");

  useEffect(() => {
    if (!weeklyResetAt) {
      setWeeklyResetAt(new Date().toISOString());
    } else {
      const resetDate = new Date(weeklyResetAt);
      const now = new Date();
      const weekInMs = 7 * 24 * 60 * 60 * 1000;
      
      if (now.getTime() - resetDate.getTime() >= weekInMs) {
        setWeeklyShareCount(0);
        setWeeklyQrCount(0);
        setWeeklyResetAt(now.toISOString());
      }
    }
  }, []);

  const canShare = isPremium || weeklyShareCount < WEEKLY_LIMIT;
  const canGenerateQr = isPremium || weeklyQrCount < WEEKLY_LIMIT;
  const canUseEmbeds = isPremium;
  const remainingShares = Math.max(0, WEEKLY_LIMIT - weeklyShareCount);
  const remainingQrCodes = Math.max(0, WEEKLY_LIMIT - weeklyQrCount);

  const showPaywall = useCallback((type: PaywallType) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setPaywallType(type);
    setPaywallVisible(true);
  }, []);

  const hidePaywall = useCallback(() => {
    setPaywallVisible(false);
  }, []);

  const checkAndIncrementShare = useCallback((): boolean => {
    if (isPremium) return true;
    
    if (weeklyShareCount >= WEEKLY_LIMIT) {
      showPaywall("share_limit");
      return false;
    }
    
    setWeeklyShareCount((prev) => prev + 1);
    return true;
  }, [isPremium, weeklyShareCount, showPaywall]);

  const checkAndIncrementQr = useCallback((): boolean => {
    if (isPremium) return true;
    
    if (weeklyQrCount >= WEEKLY_LIMIT) {
      showPaywall("qr_limit");
      return false;
    }
    
    setWeeklyQrCount((prev) => prev + 1);
    return true;
  }, [isPremium, weeklyQrCount, showPaywall]);

  const checkEmbedAccess = useCallback((): boolean => {
    if (isPremium) return true;
    
    showPaywall("embed_locked");
    return false;
  }, [isPremium, showPaywall]);

  const handleUpgrade = useCallback(() => {
    hidePaywall();
    
    Alert.alert(
      "Premium Coming Soon",
      "In-app purchases will be available in the next update. For now, enjoy BookFlow's core features!",
      [
        { text: "OK", style: "default" }
      ]
    );
  }, [hidePaywall]);

  const updatePremiumState = useCallback((state: Partial<PremiumState>) => {
    if (state.isPremium !== undefined) setIsPremium(state.isPremium);
    if (state.weeklyShareCount !== undefined) setWeeklyShareCount(state.weeklyShareCount);
    if (state.weeklyQrCount !== undefined) setWeeklyQrCount(state.weeklyQrCount);
    if (state.weeklyResetAt !== undefined) setWeeklyResetAt(state.weeklyResetAt);
  }, []);

  const refreshUsage = useCallback(() => {
    if (weeklyResetAt) {
      const resetDate = new Date(weeklyResetAt);
      const now = new Date();
      const weekInMs = 7 * 24 * 60 * 60 * 1000;
      
      if (now.getTime() - resetDate.getTime() >= weekInMs) {
        setWeeklyShareCount(0);
        setWeeklyQrCount(0);
        setWeeklyResetAt(now.toISOString());
      }
    }
  }, [weeklyResetAt]);

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        weeklyShareCount,
        weeklyQrCount,
        canShare,
        canGenerateQr,
        canUseEmbeds,
        remainingShares,
        remainingQrCodes,
        paywallVisible,
        paywallType,
        showPaywall,
        hidePaywall,
        checkAndIncrementShare,
        checkAndIncrementQr,
        checkEmbedAccess,
        handleUpgrade,
        updatePremiumState,
        refreshUsage,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error("usePremium must be used within a PremiumProvider");
  }
  return context;
}
