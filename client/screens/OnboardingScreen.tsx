import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  FlatList,
  ImageBackground,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type OnboardingScreenProps = {
  navigation: NativeStackNavigationProp<any>;
  onComplete: () => void;
};

const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2000&auto=format&fit=crop",
];

interface OnboardingPage {
  id: string;
  type: "welcome" | "feature" | "benefit";
  badge?: string;
  title: string;
  italicPart?: string;
  subtitle: string;
  buttonText: string;
  secondaryButton?: string;
  showTrustIndicators?: boolean;
  centerContent?: React.ReactNode;
}

const ONBOARDING_PAGES: OnboardingPage[] = [
  {
    id: "welcome",
    type: "welcome",
    badge: "PREMIUM DETAILING SOFTWARE",
    title: "Craftsmanship",
    italicPart: "Meets",
    subtitle:
      "Effortlessly schedule appointments, manage clients, and grow your auto detailing empire. No interruptions.",
    buttonText: "Get Started",
    secondaryButton: "Watch Demo",
    showTrustIndicators: true,
  },
  {
    id: "scheduling",
    type: "feature",
    title: "Effortless",
    italicPart: "Scheduling.",
    subtitle:
      "Let clients book your premium detailing services instantly. Sync your calendar and never miss a wash.",
    buttonText: "Continue",
  },
  {
    id: "analytics",
    type: "benefit",
    title: "Master Your",
    italicPart: "Schedule",
    subtitle:
      "Track appointments, manage your workflow, and watch your business grow with precision analytics.",
    buttonText: "Get Started",
  },
];

function FloatingBadge({ text }: { text: string }) {
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.badge, animatedStyle]}>
      <BlurView intensity={20} style={styles.badgeBlur}>
        <Text style={styles.badgeText}>{text}</Text>
      </BlurView>
    </Animated.View>
  );
}

function SchedulingVisual() {
  return (
    <View style={styles.visualContainer}>
      <View style={styles.glowEffect} />
      <Svg width={220} height={220} viewBox="0 0 100 100" style={styles.svg}>
        <Circle
          cx="50"
          cy="50"
          r="45"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
          fill="transparent"
        />
        <Circle
          cx="50"
          cy="50"
          r="45"
          stroke="white"
          strokeWidth="1.5"
          fill="transparent"
          strokeDasharray="283"
          strokeDashoffset="70"
          strokeLinecap="round"
          rotation="-90"
          origin="50,50"
        />
      </Svg>
      <View style={styles.visualContent}>
        <View style={styles.iconCircle}>
          <Feather name="clock" size={28} color="white" />
        </View>
        <View style={styles.availabilityRow}>
          <Text style={styles.availabilityNumber}>24</Text>
          <Text style={styles.availabilitySup}>/7</Text>
        </View>
        <Text style={styles.availabilityLabel}>AVAILABILITY</Text>
      </View>
      <View style={styles.liveIndicator}>
        <BlurView intensity={40} style={styles.liveIndicatorBlur}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Booking Live</Text>
        </BlurView>
      </View>
    </View>
  );
}

function RevenueVisual() {
  return (
    <View style={styles.visualContainer}>
      <View style={styles.glowEffect} />
      <Svg width={220} height={220} viewBox="0 0 100 100" style={styles.svg}>
        <Circle
          cx="50"
          cy="50"
          r="45"
          stroke="#333"
          strokeWidth="2"
          fill="transparent"
        />
        <Circle
          cx="50"
          cy="50"
          r="45"
          stroke="white"
          strokeWidth="3"
          fill="transparent"
          strokeDasharray="215 283"
          strokeLinecap="round"
          rotation="-90"
          origin="50,50"
        />
      </Svg>
      <View style={[styles.dashedBorder]} />
      <View style={styles.visualContent}>
        <Text style={styles.revenueLabel}>TOTAL REVENUE</Text>
        <Text style={styles.revenueAmount}>$8,450</Text>
        <View style={styles.growthBadge}>
          <Feather name="trending-up" size={12} color="#4ade80" />
          <Text style={styles.growthText}>+12%</Text>
        </View>
      </View>
    </View>
  );
}

function PageIndicator({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <View style={styles.pageIndicatorContainer}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.pageIndicatorDot,
            current === index && styles.pageIndicatorDotActive,
          ]}
        />
      ))}
    </View>
  );
}

function TrustIndicators() {
  return (
    <Animated.View
      entering={FadeInUp.delay(800).duration(600)}
      style={styles.trustContainer}
    >
      <View style={styles.avatarStack}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={[styles.avatar, { marginLeft: i > 1 ? -12 : 0 }]}>
            <Feather name="user" size={16} color="white" />
          </View>
        ))}
      </View>
      <View>
        <Text style={styles.trustText}>
          Trusted by <Text style={styles.trustHighlight}>2,000+</Text> detailers
        </Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Feather key={i} name="star" size={12} color="#FBBF24" />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

function OnboardingPageComponent({
  page,
  index,
  total,
  onNext,
  onSkip,
}: {
  page: OnboardingPage;
  index: number;
  total: number;
  onNext: () => void;
  onSkip: () => void;
}) {
  const insets = useSafeAreaInsets();

  const renderCenterContent = () => {
    if (page.type === "feature") {
      return <SchedulingVisual />;
    }
    if (page.type === "benefit") {
      return <RevenueVisual />;
    }
    return null;
  };

  return (
    <ImageBackground
      source={{ uri: BACKGROUND_IMAGES[index % BACKGROUND_IMAGES.length] }}
      style={[styles.page, { width: SCREEN_WIDTH }]}
      resizeMode="cover"
    >
      <LinearGradient
        colors={[
          "rgba(0,0,0,0.2)",
          "rgba(0,0,0,0.5)",
          "rgba(0,0,0,0.85)",
          "rgba(0,0,0,1)",
        ]}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.content,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        {page.type === "welcome" ? (
          <Animated.View
            entering={FadeIn.delay(200).duration(400)}
            style={styles.header}
          >
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Feather name="calendar" size={18} color="white" />
              </View>
              <Text style={styles.logoText}>BookFlow</Text>
            </View>
            <Pressable onPress={onSkip}>
              <Text style={styles.loginText}>Log In</Text>
            </Pressable>
          </Animated.View>
        ) : (
          <View style={styles.header}>
            <PageIndicator total={total} current={index} />
            <Pressable onPress={onSkip}>
              <Text style={styles.skipText}>SKIP</Text>
            </Pressable>
          </View>
        )}

        {page.type !== "welcome" && (
          <View style={styles.centerArea}>{renderCenterContent()}</View>
        )}

        <View style={styles.bottomContent}>
          {page.badge && <FloatingBadge text={page.badge} />}

          <Animated.View
            entering={FadeInUp.delay(400).duration(600)}
            style={styles.titleContainer}
          >
            <Text style={styles.title}>{page.title}</Text>
            {page.italicPart && (
              <Text style={styles.titleItalic}>{page.italicPart}</Text>
            )}
            {page.type === "welcome" && (
              <Text style={styles.title}>Management.</Text>
            )}
          </Animated.View>

          <Animated.Text
            entering={FadeInUp.delay(600).duration(600)}
            style={styles.subtitle}
          >
            {page.subtitle}
          </Animated.Text>

          <Animated.View
            entering={FadeInUp.delay(700).duration(600)}
            style={styles.buttonsContainer}
          >
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
              onPress={onNext}
            >
              <Text style={styles.primaryButtonText}>{page.buttonText}</Text>
              <Feather name="arrow-right" size={18} color="black" />
            </Pressable>

            {page.secondaryButton && (
              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.secondaryButtonPressed,
                ]}
              >
                <Feather name="play-circle" size={20} color="white" />
                <Text style={styles.secondaryButtonText}>
                  {page.secondaryButton}
                </Text>
              </Pressable>
            )}
          </Animated.View>

          {page.showTrustIndicators && <TrustIndicators />}

          {page.type !== "welcome" && (
            <Text style={styles.footerText}>
              Join 2,000+ detailing pros using BookFlow
            </Text>
          )}
        </View>
      </View>
    </ImageBackground>
  );
}

export default function OnboardingScreen({
  navigation,
  onComplete,
}: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (index !== currentIndex && index >= 0 && index < ONBOARDING_PAGES.length) {
      setCurrentIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_PAGES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <OnboardingPageComponent
            page={item}
            index={index}
            total={ONBOARDING_PAGES.length}
            onNext={handleNext}
            onSkip={handleSkip}
          />
        )}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  page: {
    flex: 1,
    height: SCREEN_HEIGHT,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.xs,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  loginText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "500",
  },
  skipText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 1.5,
  },
  pageIndicatorContainer: {
    flexDirection: "row",
    gap: 4,
  },
  pageIndicatorDot: {
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  pageIndicatorDotActive: {
    backgroundColor: "white",
  },
  centerArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomContent: {
    paddingBottom: Spacing.lg,
  },
  badge: {
    alignSelf: "flex-start",
    marginBottom: Spacing.lg,
  },
  badgeBlur: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "500",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  titleContainer: {
    marginBottom: Spacing.lg,
  },
  title: {
    color: "white",
    fontSize: 44,
    fontWeight: "500",
    lineHeight: 50,
  },
  titleItalic: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 44,
    fontStyle: "italic",
    fontWeight: "400",
    lineHeight: 50,
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    fontWeight: "300",
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  buttonsContainer: {
    gap: Spacing.md,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: "white",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
    shadowColor: "white",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  primaryButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  primaryButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  secondaryButtonPressed: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  secondaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  trustContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginTop: Spacing["2xl"],
  },
  avatarStack: {
    flexDirection: "row",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "black",
  },
  trustText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
  },
  trustHighlight: {
    color: "white",
    fontWeight: "600",
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
    marginTop: 2,
  },
  footerText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    textAlign: "center",
    marginTop: Spacing.lg,
  },
  visualContainer: {
    width: 220,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  glowEffect: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.1)",
    ...Platform.select({
      ios: {
        shadowColor: "white",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 40,
      },
      default: {},
    }),
  },
  svg: {
    position: "absolute",
  },
  visualContent: {
    alignItems: "center",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  availabilityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  availabilityNumber: {
    color: "white",
    fontSize: 36,
    fontWeight: "700",
  },
  availabilitySup: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 18,
    fontWeight: "400",
    marginTop: 4,
  },
  availabilityLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    letterSpacing: 3,
    marginTop: 4,
  },
  liveIndicator: {
    position: "absolute",
    top: 35,
    right: -10,
  },
  liveIndicatorBlur: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    overflow: "hidden",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ade80",
    shadowColor: "#4ade80",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  liveText: {
    color: "white",
    fontSize: 11,
    fontWeight: "500",
  },
  dashedBorder: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.1)",
  },
  revenueLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 4,
  },
  revenueAmount: {
    color: "white",
    fontSize: 36,
    fontWeight: "700",
  },
  growthBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(74,222,128,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: "rgba(74,222,128,0.3)",
    marginTop: Spacing.sm,
  },
  growthText: {
    color: "#4ade80",
    fontSize: 12,
    fontWeight: "600",
  },
});
