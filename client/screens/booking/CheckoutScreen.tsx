import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { BookingFlowParamList } from "@/navigation/BookingFlowNavigator";

type Navigation = NativeStackNavigationProp<BookingFlowParamList>;

export default function CheckoutScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<Navigation>();
  const route = useRoute();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const serviceId = (route.params as any)?.serviceId || "";
  const timeSlotId = (route.params as any)?.timeSlotId || "";

  const handleBooking = () => {
    if (!customerName.trim() || !customerEmail.trim()) {
      alert("Please fill in all fields");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const bookingId = `${Date.now()}`;
    navigation.navigate("Confirmation", { bookingId });
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
      >
        <ThemedText type="h4" style={styles.subtitle}>
          Confirm Booking
        </ThemedText>

        <View style={styles.summaryCard}>
          <ThemedText type="h3" style={styles.price}>
            $85
          </ThemedText>
          <ThemedText type="body" style={styles.summary}>
            Hair Coloring • 2 hours
          </ThemedText>
        </View>

        <View style={styles.form}>
          <ThemedText type="body" style={styles.label}>
            Name
          </ThemedText>
          <ThemedText type="body" style={styles.placeholder}>
            (Form fields coming soon)
          </ThemedText>

          <ThemedText type="body" style={[styles.label, { marginTop: Spacing.xl }]}>
            Email
          </ThemedText>
          <ThemedText type="body" style={styles.placeholder}>
            (Form fields coming soon)
          </ThemedText>
        </View>

        <Pressable
          onPress={handleBooking}
          style={[styles.bookButton, { backgroundColor: theme.accent }]}
        >
          <ThemedText
            type="body"
            style={[styles.buttonText, { color: theme.buttonText }]}
          >
            Complete Booking
          </ThemedText>
        </Pressable>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  subtitle: {
    marginBottom: Spacing["2xl"],
  },
  summaryCard: {
    padding: Spacing["2xl"],
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing["2xl"],
  },
  price: {
    fontWeight: "200",
    marginBottom: Spacing.sm,
  },
  summary: {
    opacity: 0.6,
  },
  form: {
    marginBottom: Spacing["2xl"],
  },
  label: {
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  placeholder: {
    opacity: 0.5,
    paddingVertical: Spacing.lg,
  },
  bookButton: {
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "600",
  },
});
