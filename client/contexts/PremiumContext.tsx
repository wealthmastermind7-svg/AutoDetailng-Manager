import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { Alert, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import {
  initializeRevenueCat,
  checkPremiumStatus,
  getOfferings,
  purchasePackage,
  restorePurchases,
  presentPaywall,
  presentCustomerCenter,
  PAYWALL_RESULT,
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
  isLoading: boolean;
  offerings: PurchasesOffering | null;
  showNativePaywall: () => Promise<boolean>;
  openCustomerCenter: () => Promise<boolean>;
  checkAndIncrementShare: () => boolean;
  checkAndIncrementQr: () => boolean;
  checkEmbedAccess: () => boolean;
  handleUpgrade: (plan: "monthly" | "yearly" | "lifetime") => Promise<void>;
  purchaseProduct: (pkg: PurchasesPackage) => Promise<boolean>;
  restoreSubscription: () => Promise<boolean>;
  updatePremiumState: (state: Partial<PremiumState>) => void;
  refreshUsage: () => void;
  refreshPremiumStatus: () => Promise<void>;
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
  
  const [isLoading, setIsLoading] = useState(false);
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [isRevenueCatInitialized, setIsRevenueCatInitialized] = useState(false);

  const processPaywallResult = useCallback(async (result: { result: typeof PAYWALL_RESULT[keyof typeof PAYWALL_RESULT]; success: boolean; isPremium: boolean; error?: string }): Promise<boolean> => {
    switch (result.result) {
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
        const premium = await checkPremiumStatus();
        setIsPremium(premium);
        if (premium) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert("Welcome to Premium!", "You now have unlimited access to all AutoDetailing Manager features.");
          return true;
        }
        return false;
      case PAYWALL_RESULT.CANCELLED:
        return false;
      case PAYWALL_RESULT.ERROR:
        Alert.alert("Error", "Something went wrong. Please try again.");
        return false;
      case PAYWALL_RESULT.NOT_PRESENTED:
      default:
        return false;
    }
  }, []);

  const presentAndProcessPaywall = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === "web") return false;
    
    setIsLoading(true);
    try {
      const result = await presentPaywall();
      return processPaywallResult(result);
    } catch (error) {
      console.error("Error presenting paywall:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [processPaywallResult]);

  useEffect(() => {
    async function initPurchases() {
      try {
        const initialized = await initializeRevenueCat();
        if (!initialized) {
          return;
        }
        
        const [premium, currentOfferings] = await Promise.all([
          checkPremiumStatus(),
          getOfferings(),
        ]);
        
        setIsPremium(premium);
        setOfferings(currentOfferings);
        setIsRevenueCatInitialized(true);
      } catch (error) {
        console.error("Error initializing RevenueCat on mount:", error);
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

  const ensureInitialized = useCallback(async (): Promise<{ success: boolean; offerings: PurchasesOffering | null }> => {
    if (Platform.OS === "web") return { success: false, offerings: null };
    
    if (isRevenueCatInitialized && offerings && offerings.availablePackages.length > 0) {
      return { success: true, offerings };
    }
    
    try {
      if (!isRevenueCatInitialized) {
        const initialized = await initializeRevenueCat();
        if (!initialized) {
          Alert.alert(
            "Connection Error",
            "Could not connect to subscription service. Please check your internet connection and try again.",
            [{ text: "OK", style: "default" }]
          );
          return { success: false, offerings: null };
        }
      }
      
      const [premium, currentOfferings] = await Promise.all([
        checkPremiumStatus(),
        getOfferings(),
      ]);
      
      setIsPremium(premium);
      setOfferings(currentOfferings);
      
      if (currentOfferings && currentOfferings.availablePackages.length > 0) {
        setIsRevenueCatInitialized(true);
        return { success: true, offerings: currentOfferings };
      } else {
        Alert.alert(
          "Products Not Available",
          "Unable to load subscription options. Please check your internet connection and try again.",
          [{ text: "OK", style: "default" }]
        );
        return { success: false, offerings: null };
      }
    } catch (error) {
      console.error("Error initializing RevenueCat:", error);
      Alert.alert(
        "Connection Error",
        "Could not connect to subscription service. Please check your internet connection and try again.",
        [{ text: "OK", style: "default" }]
      );
      return { success: false, offerings: null };
    }
  }, [isRevenueCatInitialized, offerings]);

  const triggerNativePaywall = useCallback(async () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Mobile Only",
        "Subscriptions are available in the iOS and Android app.",
        [{ text: "OK", style: "default" }]
      );
      return false;
    }

    const result = await ensureInitialized();
    if (!result.success) return false;

    return presentAndProcessPaywall();
  }, [ensureInitialized, presentAndProcessPaywall]);

  const checkAndIncrementShare = useCallback((): boolean => {
    if (isPremium) return true;
    
    if (weeklyShareCount >= WEEKLY_LIMIT) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      triggerNativePaywall();
      return false;
    }
    
    setWeeklyShareCount((prev) => prev + 1);
    return true;
  }, [isPremium, weeklyShareCount, triggerNativePaywall]);

  const checkAndIncrementQr = useCallback((): boolean => {
    if (isPremium) return true;
    
    if (weeklyQrCount >= WEEKLY_LIMIT) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      triggerNativePaywall();
      return false;
    }
    
    setWeeklyQrCount((prev) => prev + 1);
    return true;
  }, [isPremium, weeklyQrCount, triggerNativePaywall]);

  const checkEmbedAccess = useCallback((): boolean => {
    if (isPremium) return true;
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    triggerNativePaywall();
    return false;
  }, [isPremium, triggerNativePaywall]);

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
        Alert.alert("Welcome to Premium!", "You now have unlimited access to all AutoDetailing Manager features.");
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
  }, []);

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

  const handleUpgrade = useCallback(async (plan: "monthly" | "yearly" | "lifetime") => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Mobile Only",
        "Subscriptions are available in the iOS and Android app.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    let currentOfferings = offerings;
    
    if (!currentOfferings || currentOfferings.availablePackages.length === 0) {
      const result = await ensureInitialized();
      if (!result.success || !result.offerings || result.offerings.availablePackages.length === 0) {
        Alert.alert(
          "Products Not Available",
          "Unable to load subscription options. Please check your internet connection and try again.",
          [{ text: "OK", style: "default" }]
        );
        return;
      }
      currentOfferings = result.offerings;
    }

    const selectedPackage = currentOfferings.availablePackages.find((pkg) => {
      const identifier = pkg.identifier.toLowerCase();
      if (plan === "yearly") {
        return identifier.includes("annual") || identifier.includes("yearly") || identifier.includes("year");
      } else if (plan === "lifetime") {
        return identifier.includes("lifetime") || identifier.includes("forever") || identifier.includes("permanent");
      } else {
        return identifier.includes("monthly") || identifier.includes("month");
      }
    });

    if (!selectedPackage) {
      Alert.alert(
        "Plan Not Available",
        `The ${plan} plan is not available. Please try again.`,
        [{ text: "OK", style: "default" }]
      );
      console.error(`Could not find ${plan} package in offerings:`, currentOfferings.availablePackages.map((p) => p.identifier));
      return;
    }

    await purchaseProduct(selectedPackage);
  }, [offerings, purchaseProduct, ensureInitialized]);

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

  const refreshPremiumStatus = useCallback(async () => {
    const premium = await checkPremiumStatus();
    setIsPremium(premium);
  }, []);

  const showNativePaywall = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Mobile Only",
        "Subscriptions are available in the iOS and Android app.",
        [{ text: "OK", style: "default" }]
      );
      return false;
    }

    const result = await ensureInitialized();
    if (!result.success) return false;

    return presentAndProcessPaywall();
  }, [ensureInitialized, presentAndProcessPaywall]);

  const openCustomerCenter = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Mobile Only",
        "Subscription management is available in the iOS and Android app.",
        [{ text: "OK", style: "default" }]
      );
      return false;
    }

    const initResult = await ensureInitialized();
    if (!initResult.success) return false;

    try {
      const customerCenterResult = await presentCustomerCenter();
      if (customerCenterResult) {
        await refreshPremiumStatus();
      }
      return customerCenterResult;
    } catch (error) {
      Alert.alert("Error", "Could not open subscription management. Please try again.");
      return false;
    }
  }, [ensureInitialized, refreshPremiumStatus]);

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
        isLoading,
        offerings,
        showNativePaywall,
        openCustomerCenter,
        checkAndIncrementShare,
        checkAndIncrementQr,
        checkEmbedAccess,
        handleUpgrade,
        purchaseProduct,
        restoreSubscription,
        updatePremiumState,
        refreshUsage,
        refreshPremiumStatus,
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
