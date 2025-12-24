import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function ConfirmationScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<Navigation>();

  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.goBack();
  };

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.content,
          {
            paddingTop: insets.top + Spacing["3xl"],
            paddingBottom: insets.bottom + Spacing["3xl"],
            paddingHorizontal: Spacing.lg,
          },
        ]}
      >
        <View
          style={[styles.checkmark, { backgroundColor: theme.success }]}
        >
          <Feather name="check" size={48} color={theme.buttonText} />
        </View>

        <ThemedText type="h1" style={styles.title}>
          Booking Confirmed!
        </ThemedText>

        <ThemedText type="body" style={styles.message}>
          Your booking has been successfully confirmed. You will receive a confirmation email shortly.
        </ThemedText>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <ThemedText type="small" style={styles.detailLabel}>
              Service
            </ThemedText>
            <ThemedText type="body" style={styles.detailValue}>
              Hair Coloring
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText type="small" style={styles.detailLabel}>
              Date & Time
            </ThemedText>
            <ThemedText type="body" style={styles.detailValue}>
              Jan 20, 2025 • 2:00 PM
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <ThemedText type="small" style={styles.detailLabel}>
              Price
            </ThemedText>
            <ThemedText type="body" style={styles.detailValue}>
              $85.00
            </ThemedText>
          </View>
        </View>

        <Pressable
          onPress={handleDone}
          style={[
            styles.button,
            { backgroundColor: theme.accent },
          ]}
        >
          <ThemedText
            type="body"
            style={[styles.buttonText, { color: theme.buttonText }]}
          >
            Done
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  checkmark: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  title: {
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  message: {
    textAlign: "center",
    opacity: 0.7,
    marginBottom: Spacing["3xl"],
  },
  details: {
    width: "100%",
    marginBottom: Spacing["3xl"],
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  detailLabel: {
    opacity: 0.6,
  },
  detailValue: {
    fontWeight: "600",
  },
  button: {
    width: "100%",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "600",
  },
});
