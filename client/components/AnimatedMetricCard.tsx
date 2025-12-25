import React, { useEffect } from "react";
import { View, StyleSheet, Pressable, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, AnimationConfig } from "@/constants/theme";

interface AnimatedMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  delay?: number;
}

export function AnimatedMetricCard({
  title,
  value,
  subtitle,
  children,
  onPress,
  style,
  delay = 0,
}: AnimatedMetricCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    fadeIn.value = withTiming(1, {
      duration: AnimationConfig.timing.slow,
      easing: Easing.out(Easing.ease),
    });
  }, [fadeIn]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolate(fadeIn.value, [0, 1], [0, 1]),
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, AnimationConfig.spring);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, AnimationConfig.spring);
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <ThemedText type="small" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText type="display" style={styles.value}>
          {value}
        </ThemedText>
        {subtitle ? (
          <ThemedText type="caption" style={styles.subtitle}>
            {subtitle}
          </ThemedText>
        ) : null}
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.xl,
  },
  title: {
    opacity: 0.6,
    marginBottom: Spacing.xs,
  },
  value: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    opacity: 0.5,
  },
});
