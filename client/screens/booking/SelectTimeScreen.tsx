import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { TimeSlotButton } from "@/components/TimeSlotButton";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { BookingFlowParamList } from "@/navigation/BookingFlowNavigator";

type Navigation = NativeStackNavigationProp<BookingFlowParamList>;

const TIME_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
];

export default function SelectTimeScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<Navigation>();
  const route = useRoute();

  const serviceId = (route.params as any)?.serviceId || "";
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleContinue = () => {
    if (selectedTime) {
      const timeSlotId = `${Date.now()}`;
      navigation.navigate("Checkout", { serviceId, timeSlotId });
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing["3xl"],
          paddingHorizontal: Spacing.lg,
        }}
      >
        <ThemedText type="h4" style={styles.subtitle}>
          Select a Time
        </ThemedText>

        <View style={styles.grid}>
          {TIME_SLOTS.map((time) => (
            <TimeSlotButton
              key={time}
              time={time}
              selected={selectedTime === time}
              onPress={() => setSelectedTime(time)}
            />
          ))}
        </View>

        {selectedTime && (
          <View
            style={[
              styles.continueButton,
              { backgroundColor: theme.accent },
            ]}
          >
            <ThemedText
              type="body"
              style={[styles.buttonText, { color: theme.buttonText }]}
              onPress={handleContinue}
            >
              Continue
            </ThemedText>
          </View>
        )}
      </ScrollView>
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  continueButton: {
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "600",
  },
});
