import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, AnimationConfig } from "@/constants/theme";
import { StorageService, Booking, Service } from "@/lib/storage";
import { AnimatedMetricCard } from "@/components/AnimatedMetricCard";
import { LineGraph } from "@/components/LineGraph";
import { CircularMeter } from "@/components/CircularMeter";
import { BookingCard } from "@/components/BookingCard";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function DashboardScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeDataIfNeeded();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const initializeDataIfNeeded = async () => {
    try {
      const [existingBookings, existingServices] = await Promise.all([
        StorageService.getBookings(),
        StorageService.getServices(),
      ]);
      if (existingBookings.length === 0 || existingServices.length === 0) {
        await StorageService.initializeDemoData();
        loadData();
      }
    } catch (error) {
      console.error("Error initializing data:", error);
      setLoading(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookingsData, servicesData] = await Promise.all([
        StorageService.getBookings(),
        StorageService.getServices(),
      ]);
      setBookings(bookingsData);
      setServices(servicesData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const totalRevenue = bookings
    .filter((b) => b.status === "completed" || b.status === "confirmed")
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const upcomingBookings = bookings
    .filter((b) => b.status !== "cancelled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  const graphData = [
    { label: "Mon", value: Math.floor(Math.random() * 5000) + 2000 },
    { label: "Tue", value: Math.floor(Math.random() * 5000) + 2000 },
    { label: "Wed", value: Math.floor(Math.random() * 5000) + 2000 },
    { label: "Thu", value: Math.floor(Math.random() * 5000) + 2000 },
    { label: "Fri", value: Math.floor(Math.random() * 5000) + 2000 },
    { label: "Sat", value: Math.floor(Math.random() * 5000) + 2000 },
    { label: "Sun", value: Math.floor(Math.random() * 5000) + 2000 },
  ];

  const renderItem = ({ index }: { index: number }) => {
    switch (index) {
      case 0:
        return (
          <AnimatedMetricCard
            title="Total Revenue"
            value={`$${totalRevenue}`}
            style={styles.heroCard}
            delay={0}
          >
            <View style={styles.metersContainer}>
              <View style={styles.meterColumn}>
                <CircularMeter
                  value={confirmedCount}
                  maxValue={Math.max(confirmedCount + pendingCount, 1)}
                  size={100}
                  label="Confirmed"
                />
              </View>
              <View style={styles.meterColumn}>
                <CircularMeter
                  value={pendingCount}
                  maxValue={Math.max(confirmedCount + pendingCount, 1)}
                  size={100}
                  label="Pending"
                />
              </View>
            </View>
          </AnimatedMetricCard>
        );
      case 1:
        return <LineGraph data={graphData} title="Revenue This Week" />;
      case 2:
        return (
          <View style={styles.section}>
            <ThemedText type="h3" style={styles.sectionTitle}>
              Upcoming Bookings
            </ThemedText>
            {upcomingBookings.length === 0 && !loading && (
              <ThemedText type="body" style={styles.emptyText}>
                No upcoming bookings scheduled
              </ThemedText>
            )}
          </View>
        );
      default:
        const booking = upcomingBookings[index - 3];
        if (!booking) return null;
        return (
          <BookingCard
            key={booking.id}
            customerName={booking.customerName}
            serviceName={booking.serviceName}
            date={booking.date}
            time={booking.time}
            status={booking.status}
          />
        );
    }
  };

  const itemCount = upcomingBookings.length > 0 ? 3 + upcomingBookings.length : 3;

  return (
    <ThemedView style={styles.container}>
      <FlatList
        scrollEnabled={!loading}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          gap: Spacing.xl,
        }}
        data={Array(itemCount).fill(null)}
        renderItem={(props) => renderItem({ index: props.index })}
        keyExtractor={(_, index) => index.toString()}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroCard: {
    marginBottom: Spacing.lg,
  },
  metersContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: Spacing["2xl"],
  },
  meterColumn: {
    alignItems: "center",
  },
  section: {
    paddingVertical: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  emptyText: {
    opacity: 0.6,
    textAlign: "center",
  },
});
