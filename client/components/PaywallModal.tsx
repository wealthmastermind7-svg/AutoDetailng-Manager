import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { PurchasesPackage, PurchasesOffering } from "@/lib/revenuecat";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export type PaywallType =
  | "share_limit"
  | "qr_limit"
  | "embed_locked"
  | "soft_upsell"
  | "exit_prompt";

interface PaywallModalProps {
  visible: boolean;
  type: PaywallType;
  onClose: () => void;
  onUpgrade: (plan: "monthly" | "yearly") => void;
  isLoading?: boolean;
  offerings: PurchasesOffering | null;
  remainingCount?: number;
}

const PAYWALL_CONTENT: Record<
  PaywallType,
  {
    headline: string;
    highlightText: string;
    description: string;
    ctaText: string;
    icon: keyof typeof Feather.glyphMap;
  }
> = {
  share_limit: {
    headline: "You've Hit Your",
    highlightText: "Weekly Limit.",
    description:
      "Upgrade to share booking links without limits and keep customers booking.",
    ctaText: "Go Premium",
    icon: "share-2",
  },
  qr_limit: {
    headline: "QR Codes Help",
    highlightText: "Customers Book.",
    description:
      "Unlock unlimited QR codes with Premium and grow your bookings faster.",
    ctaText: "Go Premium",
    icon: "maximize",
  },
  embed_locked: {
    headline: "Your Website.",
    highlightText: "Your Bookings.",
    description:
      "Take bookings directly from your website with embeddable widgets.",
    ctaText: "Unlock Premium",
    icon: "code",
  },
  soft_upsell: {
    headline: "Less Admin.",
    highlightText: "More Bookings.",
    description:
      "Share booking links freely, generate unlimited QR codes, and embed booking on your website.",
    ctaText: "Go Premium",
    icon: "zap",
  },
  exit_prompt: {
    headline: "Less Friction.",
    highlightText: "Way More Impact.",
    description: "One simple plan. Unlimited growth potential.",
    ctaText: "Go Premium",
    icon: "trending-up",
  },
};

export function PaywallModal({
  visible,
  type,
  onClose,
  onUpgrade,
  isLoading = false,
  offerings,
}: PaywallModalProps) {
  const { theme: colors, isDark } = useTheme();
  const content = PAYWALL_CONTENT[type];
  const [selectedPlan, setSelectedPlan] = React.useState<"monthly" | "yearly">("yearly");

  const handleUpgrade = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onUpgrade(selectedPlan);
  };

  const handleClose = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const isHardLimit = type === "share_limit" || type === "qr_limit";
  const isSoftPaywall = type === "soft_upsell" || type === "exit_prompt";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={StyleSheet.absoluteFill}
        >
          <BlurView
            intensity={isDark ? 40 : 60}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.springify().damping(20).mass(0.8)}
          exiting={SlideOutDown.duration(200)}
          style={[styles.modalContainer]}
        >
          <View style={[styles.modal, { backgroundColor: colors.backgroundRoot }]}>
            <Pressable style={styles.closeButton} onPress={handleClose}>
              <View
                style={[
                  styles.closeButtonInner,
                  { backgroundColor: colors.backgroundSecondary },
                ]}
              >
                <Feather name="x" size={18} color={colors.textSecondary} />
              </View>
            </Pressable>

            <View style={styles.header}>
              <Text style={[styles.brandText, { color: colors.textTertiary }]}>
                BOOKFLOW
              </Text>

              <View style={styles.headlineContainer}>
                <Text style={[styles.headline, { color: colors.text }]}>
                  {content.headline}
                </Text>
                <Text style={[styles.highlightText, { color: "#00CED1" }]}>
                  {content.highlightText}
                </Text>
              </View>
            </View>

            <View style={styles.body}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: colors.backgroundSecondary },
                ]}
              >
                <Feather name={content.icon} size={32} color={colors.text} />
              </View>

              <Text style={[styles.description, { color: colors.text }]}>
                {content.description}
              </Text>

              <View style={styles.planSelector}>
                <Pressable
                  style={[
                    styles.planOption,
                    selectedPlan === "yearly" && styles.planOptionSelected,
                    selectedPlan === "yearly" && { borderColor: "#00CED1" },
                    { backgroundColor: colors.backgroundSecondary },
                  ]}
                  onPress={() => setSelectedPlan("yearly")}
                >
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>BEST VALUE</Text>
                  </View>
                  <Text style={[styles.planName, { color: colors.text }]}>Yearly</Text>
                  <Text style={[styles.planPrice, { color: colors.text }]}>
                    $269<Text style={styles.planPriceUnit}>/year</Text>
                  </Text>
                  <Text style={[styles.planSavings, { color: "#00CED1" }]}>
                    Save $180/year
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.planOption,
                    selectedPlan === "monthly" && styles.planOptionSelected,
                    selectedPlan === "monthly" && { borderColor: "#00CED1" },
                    { backgroundColor: colors.backgroundSecondary },
                  ]}
                  onPress={() => setSelectedPlan("monthly")}
                >
                  <Text style={[styles.planName, { color: colors.text }]}>Monthly</Text>
                  <Text style={[styles.planPrice, { color: colors.text }]}>
                    $29.99<Text style={styles.planPriceUnit}>/month</Text>
                  </Text>
                  <Text style={[styles.planSubtext, { color: colors.textSecondary }]}>
                    Cancel anytime
                  </Text>
                </Pressable>
              </View>

              <Pressable
                style={[styles.ctaButton, { backgroundColor: "#00CED1", opacity: isLoading ? 0.7 : 1 }]}
                onPress={handleUpgrade}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#000000" size="small" />
                ) : (
                  <Text style={[styles.ctaText, { color: "#000000" }]}>
                    {content.ctaText} - {selectedPlan === "yearly" ? "$269/year" : "$29.99/mo"}
                  </Text>
                )}
              </Pressable>

              <Text style={[styles.disclaimer, { color: colors.textTertiary }]}>
                * Prices shown in USD. Regional pricing may vary.
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: Spacing["4xl"],
  },
  modalContainer: {
    width: SCREEN_WIDTH - Spacing["2xl"] * 2,
    maxWidth: 400,
  },
  modal: {
    borderRadius: BorderRadius["2xl"],
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: Spacing.lg,
    right: Spacing.lg,
    zIndex: 10,
  },
  closeButtonInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    paddingTop: Spacing["3xl"],
    paddingHorizontal: Spacing["2xl"],
    paddingBottom: Spacing.xl,
  },
  brandText: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2,
    marginBottom: Spacing.lg,
  },
  headlineContainer: {
    gap: 0,
  },
  headline: {
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 42,
  },
  highlightText: {
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 42,
  },
  body: {
    paddingHorizontal: Spacing["2xl"],
    paddingBottom: Spacing["3xl"],
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: Spacing["2xl"],
  },
  planSelector: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  planOption: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    position: "relative",
  },
  planOptionSelected: {
    borderWidth: 2,
  },
  planBadge: {
    position: "absolute",
    top: -10,
    backgroundColor: "#00CED1",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#000000",
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
  },
  planPrice: {
    fontSize: 20,
    fontWeight: "700",
  },
  planPriceUnit: {
    fontSize: 12,
    fontWeight: "400",
  },
  planSavings: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: Spacing.xs,
  },
  planSubtext: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  ctaButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: "600",
  },
  disclaimer: {
    fontSize: 12,
    textAlign: "center",
  },
});
