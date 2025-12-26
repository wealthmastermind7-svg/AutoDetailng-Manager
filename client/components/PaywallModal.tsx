import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
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
  onUpgrade: () => void;
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
}: PaywallModalProps) {
  const { theme: colors, isDark } = useTheme();
  const content = PAYWALL_CONTENT[type];

  const handleUpgrade = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onUpgrade();
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

              <View style={styles.priceContainer}>
                <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
                  {isHardLimit ? "Upgrade to remove limits" : "Invest in your business for"}
                </Text>
                <Text style={[styles.price, { color: colors.text }]}>
                  $9.99<Text style={styles.priceUnit}>/month</Text>
                </Text>
              </View>

              <Pressable
                style={[styles.ctaButton, { backgroundColor: "#00CED1" }]}
                onPress={handleUpgrade}
              >
                <Text style={[styles.ctaText, { color: "#000000" }]}>
                  {content.ctaText}
                </Text>
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
  priceContainer: {
    marginBottom: Spacing.xl,
  },
  priceLabel: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  price: {
    fontSize: 28,
    fontWeight: "700",
  },
  priceUnit: {
    fontSize: 16,
    fontWeight: "400",
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
