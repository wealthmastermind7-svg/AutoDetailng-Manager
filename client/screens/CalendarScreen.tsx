import React, { useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { StorageService, Booking } from "@/lib/storage";
import { CalendarDay } from "@/components/CalendarDay";
import { BookingCard } from "@/components/BookingCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function CalendarScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useFocusEffect(
    React.useCallback(() => {
      loadBookings();
    }, [])
  );

  const loadBookings = async () => {
    const data = await StorageService.getBookings();
    setBookings(data);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const hasBookingOnDate = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return bookings.some((b) => b.date === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const selectedDateStr = selectedDate.split("T")[0];
  const bookingsForSelectedDate = bookings.filter((b) => b.date === selectedDateStr);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const renderDay = ({ item, index }: { item: number; index: number }) => {
    if (emptyDays.includes(index)) {
      return <View style={styles.emptyDay} />;
    }

    const day = days[index - firstDay];
    if (!day) return <View style={styles.emptyDay} />;

    const dateStr = `${currentMonth.getFullYear()}-${String(
      currentMonth.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    return (
      <CalendarDay
        day={day}
        isSelected={dateStr === selectedDateStr}
        hasBookings={hasBookingOnDate(day)}
        isToday={isToday(day)}
        isDisabled={false}
        onPress={() => setSelectedDate(dateStr)}
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: headerHeight + Spacing.lg }]}>
        <ThemedText type="h3" style={styles.monthTitle}>
          {monthName}
        </ThemedText>
        <View style={styles.weekDays}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <ThemedText key={day} type="small" style={styles.weekDay}>
              {day}
            </ThemedText>
          ))}
        </View>
      </View>

      <FlatList
        scrollEnabled={false}
        numColumns={7}
        data={Array(emptyDays.length + days.length).fill(null)}
        renderItem={renderDay}
        keyExtractor={(_, index) => index.toString()}
        style={styles.grid}
        columnWrapperStyle={styles.row}
      />

      <View
        style={[
          styles.bookingsSection,
          { paddingBottom: tabBarHeight + Spacing.xl },
        ]}
      >
        <ThemedText type="h4" style={styles.bookingsTitle}>
          {bookingsForSelectedDate.length > 0
            ? `${bookingsForSelectedDate.length} booking${
                bookingsForSelectedDate.length !== 1 ? "s" : ""
              }`
            : "No bookings"}
        </ThemedText>
        <FlatList
          scrollEnabled={false}
          data={bookingsForSelectedDate}
          renderItem={({ item }) => (
            <BookingCard
              customerName={item.customerName}
              serviceName={item.serviceName}
              date={item.date}
              time={item.time}
              status={item.status}
            />
          )}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  monthTitle: {
    marginBottom: Spacing.lg,
  },
  weekDays: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  weekDay: {
    flex: 1,
    textAlign: "center",
    opacity: 0.6,
  },
  grid: {
    paddingHorizontal: Spacing.lg,
  },
  row: {
    justifyContent: "space-around",
    marginBottom: Spacing.lg,
  },
  emptyDay: {
    width: "14.2%",
  },
  bookingsSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  bookingsTitle: {
    marginBottom: Spacing.lg,
  },
  separator: {
    height: Spacing.lg,
  },
});
