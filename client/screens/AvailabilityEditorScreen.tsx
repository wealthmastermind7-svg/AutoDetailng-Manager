import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Switch,
  Keyboard,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { api, Availability, AvailabilitySchedule } from "@/lib/api";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { CalendarStackParamList } from "@/navigation/CalendarStackNavigator";

type AvailabilityNavigationProp = NativeStackNavigationProp<
  CalendarStackParamList,
  "AvailabilityEditor"
>;

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const TIME_OPTIONS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00"
];

interface DaySchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

function formatTime(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export default function AvailabilityEditorScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AvailabilityNavigationProp>();
  const { theme } = useTheme();

  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    setLoading(true);
    try {
      const availability = await api.getAvailability();
      const defaultSchedules: DaySchedule[] = DAY_NAMES.map((_, index) => ({
        dayOfWeek: index,
        startTime: "09:00",
        endTime: "17:00",
        isActive: index >= 1 && index <= 5,
      }));

      availability.forEach((avail) => {
        const index = defaultSchedules.findIndex((s) => s.dayOfWeek === avail.dayOfWeek);
        if (index >= 0) {
          defaultSchedules[index] = {
            dayOfWeek: avail.dayOfWeek,
            startTime: avail.startTime,
            endTime: avail.endTime,
            isActive: avail.isActive ?? true,
          };
        }
      });

      setSchedules(defaultSchedules);
    } catch (error) {
      console.error("Error loading availability:", error);
      const defaultSchedules: DaySchedule[] = DAY_NAMES.map((_, index) => ({
        dayOfWeek: index,
        startTime: "09:00",
        endTime: "17:00",
        isActive: index >= 1 && index <= 5,
      }));
      setSchedules(defaultSchedules);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDay = (dayOfWeek: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSchedules((prev) =>
      prev.map((s) =>
        s.dayOfWeek === dayOfWeek ? { ...s, isActive: !s.isActive } : s
      )
    );
    setHasChanges(true);
  };

  const handleUpdateTime = (dayOfWeek: number, field: "startTime" | "endTime", value: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSchedules((prev) =>
      prev.map((s) =>
        s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s
      )
    );
    setHasChanges(true);
    setEditingDay(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Keyboard.dismiss();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const availabilitySchedules: AvailabilitySchedule[] = schedules.map((s) => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        isActive: s.isActive,
      }));

      await api.bulkUpdateAvailability(availabilitySchedules);
      setHasChanges(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (error) {
      console.error("Error saving availability:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Save Failed",
        "Unable to save your business hours. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.text} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing["3xl"] },
        ]}
      >
        <ThemedText type="body" style={styles.description}>
          Set your business hours for each day of the week. Customers can only book during active hours.
        </ThemedText>

        {schedules.map((schedule) => (
          <Card key={schedule.dayOfWeek} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <View style={styles.dayInfo}>
                <ThemedText type="h4" style={styles.dayName}>
                  {DAY_NAMES[schedule.dayOfWeek]}
                </ThemedText>
                <ThemedText type="small" style={[styles.dayStatus, { color: theme.textSecondary }]}>
                  {schedule.isActive
                    ? `${formatTime(schedule.startTime)} - ${formatTime(schedule.endTime)}`
                    : "Closed"}
                </ThemedText>
              </View>
              <Switch
                value={schedule.isActive}
                onValueChange={() => handleToggleDay(schedule.dayOfWeek)}
                trackColor={{ false: theme.borderLight, true: theme.accent }}
                thumbColor={theme.backgroundRoot}
              />
            </View>

            {schedule.isActive ? (
              <View style={styles.timeContainer}>
                <View style={styles.timeRow}>
                  <ThemedText type="body" style={styles.timeLabel}>Opens</ThemedText>
                  <View style={styles.timeButtons}>
                    {TIME_OPTIONS.slice(0, 8).map((time) => (
                      <Pressable
                        key={`start-${time}`}
                        onPress={() => handleUpdateTime(schedule.dayOfWeek, "startTime", time)}
                        style={[
                          styles.timeButton,
                          {
                            backgroundColor:
                              schedule.startTime === time
                                ? theme.accent
                                : theme.backgroundSecondary,
                          },
                        ]}
                      >
                        <ThemedText
                          type="small"
                          style={[
                            styles.timeButtonText,
                            {
                              color:
                                schedule.startTime === time
                                  ? theme.buttonText
                                  : theme.text,
                            },
                          ]}
                        >
                          {formatTime(time).replace(":00", "")}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.timeRow}>
                  <ThemedText type="body" style={styles.timeLabel}>Closes</ThemedText>
                  <View style={styles.timeButtons}>
                    {TIME_OPTIONS.slice(8).map((time) => (
                      <Pressable
                        key={`end-${time}`}
                        onPress={() => handleUpdateTime(schedule.dayOfWeek, "endTime", time)}
                        style={[
                          styles.timeButton,
                          {
                            backgroundColor:
                              schedule.endTime === time
                                ? theme.accent
                                : theme.backgroundSecondary,
                          },
                        ]}
                      >
                        <ThemedText
                          type="small"
                          style={[
                            styles.timeButtonText,
                            {
                              color:
                                schedule.endTime === time
                                  ? theme.buttonText
                                  : theme.text,
                            },
                          ]}
                        >
                          {formatTime(time).replace(":00", "")}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            ) : null}
          </Card>
        ))}
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + Spacing.lg,
            backgroundColor: theme.backgroundRoot,
            borderTopColor: theme.borderLight,
          },
        ]}
      >
        <Button
          onPress={handleSave}
          disabled={saving || !hasChanges}
          style={styles.saveButton}
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  description: {
    marginBottom: Spacing.xl,
    opacity: 0.7,
  },
  dayCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    marginBottom: Spacing.xs,
  },
  dayStatus: {
    opacity: 0.7,
  },
  timeContainer: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  timeRow: {
    marginBottom: Spacing.md,
  },
  timeLabel: {
    marginBottom: Spacing.sm,
    opacity: 0.7,
  },
  timeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  timeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
  },
  timeButtonText: {
    fontSize: 12,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
  },
  saveButton: {
    width: "100%",
  },
});
