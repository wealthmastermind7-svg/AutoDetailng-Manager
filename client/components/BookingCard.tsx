import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, AnimationConfig } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

interface BookingCardProps {
  customerName: string;
  serviceName: string;
  date: string;
  time: string;
  status: BookingStatus;
  onPress?: () => void;
}

export function BookingCard({
  customerName,
  serviceName,
  date,
  time,
  status,
  onPress,
}: BookingCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, AnimationConfig.spring);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, AnimationConfig.spring);
  };

  const getStatusColor = () => {
    switch (status) {
      case "confirmed":
        return theme.success;
      case "pending":
        return theme.warning;
      case "completed":
        return theme.textSecondary;
      case "cancelled":
        return theme.error;
      default:
        return theme.textSecondary;
    }
  };

  const getStatusIcon = (): "check-circle" | "clock" | "x-circle" | "check" => {
    switch (status) {
      case "confirmed":
        return "check-circle";
      case "pending":
        return "clock";
      case "completed":
        return "check";
      case "cancelled":
        return "x-circle";
      default:
        return "clock";
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.customerInfo}>
          <ThemedText type="h4" style={styles.customerName}>
            {customerName}
          </ThemedText>
          <ThemedText type="small" style={styles.serviceName}>
            {serviceName}
          </ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Feather name={getStatusIcon()} size={14} color={theme.buttonText} />
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.dateTime}>
          <Feather name="calendar" size={14} color={theme.textSecondary} />
          <ThemedText type="small" style={styles.dateTimeText}>
            {date}
          </ThemedText>
        </View>
        <View style={styles.dateTime}>
          <Feather name="clock" size={14} color={theme.textSecondary} />
          <ThemedText type="small" style={styles.dateTimeText}>
            {time}
          </ThemedText>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    marginBottom: Spacing.xs,
  },
  serviceName: {
    opacity: 0.6,
  },
  statusBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    gap: Spacing.xl,
  },
  dateTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  dateTimeText: {
    opacity: 0.6,
  },
});
