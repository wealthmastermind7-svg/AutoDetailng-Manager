import React from "react";
import { StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, AnimationConfig } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CalendarDayProps {
  day: number;
  isSelected: boolean;
  hasBookings: boolean;
  isToday: boolean;
  isDisabled: boolean;
  onPress: () => void;
}

export function CalendarDay({
  day,
  isSelected,
  hasBookings,
  isToday,
  isDisabled,
  onPress,
}: CalendarDayProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!isDisabled) {
      scale.value = withSpring(0.9, AnimationConfig.spring);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, AnimationConfig.spring);
  };

  const getBackgroundColor = () => {
    if (isSelected) return theme.accent;
    if (hasBookings) return theme.backgroundSecondary;
    return "transparent";
  };

  const getTextColor = () => {
    if (isSelected) return theme.buttonText;
    if (isDisabled) return theme.textTertiary;
    return theme.text;
  };

  const getBorderColor = () => {
    if (isToday && !isSelected) return theme.accent;
    return "transparent";
  };

  return (
    <AnimatedPressable
      onPress={isDisabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.day,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: isToday && !isSelected ? 2 : 0,
        },
        animatedStyle,
      ]}
    >
      <ThemedText
        type="body"
        style={[styles.dayText, { color: getTextColor() }]}
      >
        {day}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  day: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    fontWeight: "500",
  },
});
