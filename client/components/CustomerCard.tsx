import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, AnimationConfig } from "@/constants/theme";

interface CustomerCardProps {
  name: string;
  email: string;
  phone?: string;
  totalBookings: number;
  onPress?: () => void;
}

export function CustomerCard({
  name,
  email,
  phone,
  totalBookings,
  onPress,
}: CustomerCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, AnimationConfig.spring);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, AnimationConfig.spring);
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
      <View style={styles.content}>
        <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
          <ThemedText
            type="h4"
            style={[styles.initials, { color: theme.buttonText }]}
          >
            {getInitials(name)}
          </ThemedText>
        </View>
        <View style={styles.info}>
          <ThemedText type="h4" style={styles.name}>
            {name}
          </ThemedText>
          <ThemedText type="small" style={styles.email}>
            {email}
          </ThemedText>
          {phone ? (
            <ThemedText type="caption" style={styles.phone}>
              {phone}
            </ThemedText>
          ) : null}
        </View>
        <View style={styles.stats}>
          <ThemedText type="h3" style={styles.bookingCount}>
            {totalBookings}
          </ThemedText>
          <ThemedText type="caption" style={styles.bookingLabel}>
            bookings
          </ThemedText>
        </View>
      </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    fontWeight: "600",
  },
  info: {
    flex: 1,
    marginLeft: Spacing.lg,
  },
  name: {
    marginBottom: Spacing.xs,
  },
  email: {
    opacity: 0.6,
  },
  phone: {
    opacity: 0.5,
    marginTop: Spacing.xs,
  },
  stats: {
    alignItems: "center",
  },
  bookingCount: {
    fontWeight: "200",
  },
  bookingLabel: {
    opacity: 0.5,
  },
});
