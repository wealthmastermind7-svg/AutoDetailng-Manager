import React from "react";
import { StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, AnimationConfig } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TimeSlotButtonProps {
  time: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function TimeSlotButton({
  time,
  selected,
  onPress,
  disabled = false,
}: TimeSlotButtonProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withSpring(0.95, AnimationConfig.spring);
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, AnimationConfig.spring);
  };

  return (
    <AnimatedPressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.button,
        {
          backgroundColor: selected ? theme.accent : theme.backgroundDefault,
          opacity: disabled ? 0.4 : 1,
        },
        animatedStyle,
      ]}
    >
      <ThemedText
        type="body"
        style={[
          styles.text,
          { color: selected ? theme.buttonText : theme.text },
        ]}
      >
        {time}
      </ThemedText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing["2xl"],
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  text: {
    fontWeight: "500",
  },
});
