import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Path, Line, Text as SvgText } from "react-native-svg";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, AnimationConfig } from "@/constants/theme";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface DataPoint {
  label: string;
  value: number;
}

interface LineGraphProps {
  data: DataPoint[];
  title?: string;
  height?: number;
}

export function LineGraph({ data, title, height = 200 }: LineGraphProps) {
  const { theme } = useTheme();
  const progress = useSharedValue(0);
  const screenWidth = Dimensions.get("window").width;
  const graphWidth = screenWidth - Spacing.lg * 2 - Spacing["2xl"] * 2;
  const graphHeight = height - 60;

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: AnimationConfig.timing.graph,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
    });
  }, [progress]);

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const valueRange = maxValue - minValue || 1;

  const points = data.map((point, index) => {
    const x = (index / (data.length - 1)) * graphWidth;
    const y = graphHeight - ((point.value - minValue) / valueRange) * (graphHeight - 20);
    return { x, y };
  });

  const pathData = points
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      const prev = points[index - 1];
      const cpx1 = prev.x + (point.x - prev.x) / 2;
      const cpy1 = prev.y;
      const cpx2 = prev.x + (point.x - prev.x) / 2;
      const cpy2 = point.y;
      return `C ${cpx1} ${cpy1} ${cpx2} ${cpy2} ${point.x} ${point.y}`;
    })
    .join(" ");

  const pathLength = graphWidth * 2;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: pathLength * (1 - progress.value),
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundDefault }]}>
      {title ? (
        <ThemedText type="h4" style={styles.title}>
          {title}
        </ThemedText>
      ) : null}
      <View style={styles.graphContainer}>
        <Svg width={graphWidth} height={graphHeight + 30}>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <Line
              key={i}
              x1={0}
              y1={ratio * (graphHeight - 20) + 10}
              x2={graphWidth}
              y2={ratio * (graphHeight - 20) + 10}
              stroke={theme.borderLight}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          ))}
          <AnimatedPath
            d={pathData}
            fill="none"
            stroke={theme.accent}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={pathLength}
            animatedProps={animatedProps}
          />
          {data.map((point, index) => (
            <SvgText
              key={index}
              x={points[index].x}
              y={graphHeight + 25}
              fontSize={10}
              fill={theme.textSecondary}
              textAnchor="middle"
            >
              {point.label}
            </SvgText>
          ))}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.xl,
  },
  title: {
    marginBottom: Spacing.lg,
  },
  graphContainer: {
    alignItems: "center",
  },
});
