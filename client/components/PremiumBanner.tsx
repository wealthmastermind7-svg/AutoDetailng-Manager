import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { usePremium } from "@/contexts/PremiumContext";

interface PremiumBannerProps {
  onPress?: () => void;
}

export function PremiumBanner({ onPress }: PremiumBannerProps) {
  const { theme: colors } = useTheme();
  const { isPremium, showNativePaywall } = usePremium();

  if (isPremium) return null;

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress();
    } else {
      showNativePaywall();
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <View
        style={[
          styles.container,
          { backgroundColor: colors.backgroundSecondary },
        ]}
      >
        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: "#00CED1" }]}>
            <Feather name="zap" size={16} color="#000000" />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              Grow faster with Premium
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Unlimited booking links, QR codes, and website embeds
            </Text>
          </View>
        </View>
        <Feather name="chevron-right" size={20} color={colors.textSecondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
  },
});
