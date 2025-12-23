import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, AnimationConfig } from "@/constants/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularMeterProps {
  value: number;
  maxValue: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showPercentage?: boolean;
}

export function CircularMeter({
  value,
  maxValue,
  size = 120,
  strokeWidth = 8,
  label,
  showPercentage = true,
}: CircularMeterProps) {
  const { theme } = useTheme();
  const progress = useSharedValue(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((value / maxValue) * 100, 100);

  useEffect(() => {
    progress.value = withTiming(percentage / 100, {
      duration: AnimationConfig.timing.graph,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
    });
  }, [percentage, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.meterContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.borderLight}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.accent}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.centerContent}>
          {showPercentage ? (
            <ThemedText type="h3" style={styles.percentageText}>
              {Math.round(percentage)}%
            </ThemedText>
          ) : null}
        </View>
      </View>
      {label ? (
        <ThemedText type="small" style={styles.label}>
          {label}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  meterContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  centerContent: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  percentageText: {
    fontWeight: "200",
  },
  label: {
    marginTop: Spacing.sm,
    opacity: 0.7,
  },
});
