import { Platform } from "react-native";
import Purchases, {
  LOG_LEVEL,
  CustomerInfo,
  PurchasesPackage,
  PurchasesOffering,
} from "react-native-purchases";
import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

const ENTITLEMENT_ID = "AutoDetailng Manager Pro";

function getApiKey(): string | null {
  if (Platform.OS === "ios") {
    return process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS || process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || null;
  }
  if (Platform.OS === "android") {
    return process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID || process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || null;
  }
  return null;
}

let isInitialized = false;

export async function initializeRevenueCat(): Promise<boolean> {
  if (isInitialized) {
    return true;
  }

  if (Platform.OS === "web") {
    console.log("RevenueCat: Skipping initialization on web platform");
    return false;
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    console.log("RevenueCat: No API key configured for platform", Platform.OS);
    return false;
  }

  try {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    
    console.log(`RevenueCat: Configuring with ${Platform.OS} API key`);
    
    await Purchases.configure({ apiKey });
    isInitialized = true;
    console.log("RevenueCat: Successfully initialized");
    return true;
  } catch (error) {
    console.error("RevenueCat: Failed to initialize", error);
    return false;
  }
}

export async function checkPremiumStatus(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isPremium = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";
    console.log(`RevenueCat: Premium status = ${isPremium}`);
    return isPremium;
  } catch (error) {
    console.error("RevenueCat: Failed to check premium status", error);
    return false;
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (Platform.OS === "web") {
    return null;
  }

  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.error("RevenueCat: Failed to get customer info", error);
    return null;
  }
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (Platform.OS === "web") {
    return null;
  }

  try {
    const offerings = await Purchases.getOfferings();
    if (offerings.current) {
      console.log("RevenueCat: Current offering found", offerings.current.identifier);
      return offerings.current;
    }
    console.log("RevenueCat: No current offering available");
    return null;
  } catch (error) {
    console.error("RevenueCat: Failed to get offerings", error);
    return null;
  }
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<{
  success: boolean;
  isPremium: boolean;
  error?: string;
}> {
  if (Platform.OS === "web") {
    return { success: false, isPremium: false, error: "Purchases not available on web" };
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPremium = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";
    console.log(`RevenueCat: Purchase successful, premium = ${isPremium}`);
    return { success: true, isPremium };
  } catch (error: any) {
    if (error.userCancelled) {
      console.log("RevenueCat: User cancelled purchase");
      return { success: false, isPremium: false, error: "cancelled" };
    }
    console.error("RevenueCat: Purchase failed", error);
    return { success: false, isPremium: false, error: error.message || "Purchase failed" };
  }
}

export async function restorePurchases(): Promise<{
  success: boolean;
  isPremium: boolean;
  error?: string;
}> {
  if (Platform.OS === "web") {
    return { success: false, isPremium: false, error: "Restore not available on web" };
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPremium = typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined";
    console.log(`RevenueCat: Restore successful, premium = ${isPremium}`);
    return { success: true, isPremium };
  } catch (error: any) {
    console.error("RevenueCat: Restore failed", error);
    return { success: false, isPremium: false, error: error.message || "Restore failed" };
  }
}

export async function presentPaywall(): Promise<{
  success: boolean;
  isPremium: boolean;
  result: PAYWALL_RESULT;
}> {
  if (Platform.OS === "web") {
    return { success: false, isPremium: false, result: PAYWALL_RESULT.NOT_PRESENTED };
  }

  try {
    const paywallResult = await RevenueCatUI.presentPaywall();
    
    switch (paywallResult) {
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
        const isPremium = await checkPremiumStatus();
        console.log(`RevenueCat: Paywall result = ${paywallResult}, premium = ${isPremium}`);
        return { success: true, isPremium, result: paywallResult };
      case PAYWALL_RESULT.CANCELLED:
        console.log("RevenueCat: User cancelled paywall");
        return { success: false, isPremium: false, result: paywallResult };
      case PAYWALL_RESULT.NOT_PRESENTED:
      case PAYWALL_RESULT.ERROR:
      default:
        console.log(`RevenueCat: Paywall not completed, result = ${paywallResult}`);
        return { success: false, isPremium: false, result: paywallResult };
    }
  } catch (error) {
    console.error("RevenueCat: Failed to present paywall", error);
    return { success: false, isPremium: false, result: PAYWALL_RESULT.ERROR };
  }
}

export async function presentPaywallIfNeeded(): Promise<{
  success: boolean;
  isPremium: boolean;
  result: PAYWALL_RESULT;
}> {
  if (Platform.OS === "web") {
    return { success: false, isPremium: false, result: PAYWALL_RESULT.NOT_PRESENTED };
  }

  try {
    const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: ENTITLEMENT_ID,
    });
    
    switch (paywallResult) {
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
        const isPremium = await checkPremiumStatus();
        return { success: true, isPremium, result: paywallResult };
      case PAYWALL_RESULT.NOT_PRESENTED:
        return { success: true, isPremium: true, result: paywallResult };
      default:
        return { success: false, isPremium: false, result: paywallResult };
    }
  } catch (error) {
    console.error("RevenueCat: Failed to present paywall if needed", error);
    return { success: false, isPremium: false, result: PAYWALL_RESULT.ERROR };
  }
}

export async function presentCustomerCenter(): Promise<boolean> {
  if (Platform.OS === "web") {
    console.log("RevenueCat: Customer Center not available on web");
    return false;
  }

  try {
    await RevenueCatUI.presentCustomerCenter();
    console.log("RevenueCat: Customer Center presented successfully");
    return true;
  } catch (error) {
    console.error("RevenueCat: Failed to present Customer Center", error);
    return false;
  }
}

export async function identifyUser(userId: string): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  try {
    await Purchases.logIn(userId);
    console.log(`RevenueCat: User identified as ${userId}`);
    return true;
  } catch (error) {
    console.error("RevenueCat: Failed to identify user", error);
    return false;
  }
}

export async function logoutUser(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  try {
    await Purchases.logOut();
    console.log("RevenueCat: User logged out");
    return true;
  } catch (error) {
    console.error("RevenueCat: Failed to logout user", error);
    return false;
  }
}

export { Purchases, RevenueCatUI, ENTITLEMENT_ID, PAYWALL_RESULT };
export type { CustomerInfo, PurchasesPackage, PurchasesOffering };
