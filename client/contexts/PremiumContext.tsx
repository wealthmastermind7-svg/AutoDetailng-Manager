import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { Alert, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { PaywallType } from "@/components/PaywallModal";
import {
  initializeRevenueCat,
  checkPremiumStatus,
  getOfferings,
  purchasePackage,
  restorePurchases,
  PurchasesPackage,
  PurchasesOffering,
} from "@/lib/revenuecat";

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
  isLoading: boolean;
  offerings: PurchasesOffering | null;
  showPaywall: (type: PaywallType) => void;
  hidePaywall: () => void;
  checkAndIncrementShare: () => boolean;
  checkAndIncrementQr: () => boolean;
  checkEmbedAccess: () => boolean;
  handleUpgrade: () => void;
  purchaseProduct: (pkg: PurchasesPackage) => Promise<boolean>;
  restoreSubscription: () => Promise<boolean>;
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
  const [isLoading, setIsLoading] = useState(false);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);

  useEffect(() => {
    async function initPurchases() {
      const initialized = await initializeRevenueCat();
      if (initialized) {
        const premium = await checkPremiumStatus();
        setIsPremium(premium);
        
        const currentOfferings = await getOfferings();
        setOfferings(currentOfferings);
      }
    }
    initPurchases();
  }, []);

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

  const purchaseProduct = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    if (Platform.OS === "web") {
      Alert.alert("Not Available", "Subscriptions are only available in the mobile app.");
      return false;
    }

    setIsLoading(true);
    try {
      const result = await purchasePackage(pkg);
      if (result.success && result.isPremium) {
        setIsPremium(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        hidePaywall();
        Alert.alert("Welcome to Premium!", "You now have unlimited access to all BookFlow features.");
        return true;
      } else if (result.error === "cancelled") {
        return false;
      } else {
        Alert.alert("Purchase Failed", result.error || "Please try again.");
        return false;
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [hidePaywall]);

  const restoreSubscription = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === "web") {
      Alert.alert("Not Available", "Restore is only available in the mobile app.");
      return false;
    }

    setIsLoading(true);
    try {
      const result = await restorePurchases();
      if (result.success && result.isPremium) {
        setIsPremium(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Restored!", "Your premium subscription has been restored.");
        return true;
      } else {
        Alert.alert("No Subscription Found", "We couldn't find an active subscription to restore.");
        return false;
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUpgrade = useCallback(() => {
    if (offerings && offerings.availablePackages.length > 0) {
      hidePaywall();
    } else if (Platform.OS === "web") {
      hidePaywall();
      Alert.alert(
        "Mobile Only",
        "Subscriptions are available in the iOS and Android app.",
        [{ text: "OK", style: "default" }]
      );
    } else {
      hidePaywall();
      Alert.alert(
        "Coming Soon",
        "In-app purchases will be available shortly.",
        [{ text: "OK", style: "default" }]
      );
    }
  }, [hidePaywall, offerings]);

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
        isLoading,
        offerings,
        showPaywall,
        hidePaywall,
        checkAndIncrementShare,
        checkAndIncrementQr,
        checkEmbedAccess,
        handleUpgrade,
        purchaseProduct,
        restoreSubscription,
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
