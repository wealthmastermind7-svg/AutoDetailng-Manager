import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { StorageService, Customer } from "@/lib/storage";
import { CustomerCard } from "@/components/CustomerCard";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";

export default function CustomersScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeDataIfNeeded();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadCustomers();
    }, [])
  );

  const initializeDataIfNeeded = async () => {
    try {
      const existingCustomers = await StorageService.getCustomers();
      if (existingCustomers.length === 0) {
        await StorageService.initializeDemoData();
        loadCustomers();
      }
    } catch (error) {
      console.error("Error initializing data:", error);
    }
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await StorageService.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    Alert.alert(
      customer.name,
      `Email: ${customer.email}\nPhone: ${customer.phone || "N/A"}\nTotal Bookings: ${customer.totalBookings}`,
      [{ text: "Close", style: "default" }]
    );
  };

  const renderItem = ({ item }: { item: Customer }) => (
    <CustomerCard
      name={item.name}
      email={item.email}
      phone={item.phone}
      totalBookings={item.totalBookings}
      onPress={() => handleSelectCustomer(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={[styles.emptyState, { paddingTop: headerHeight + Spacing["3xl"] }]}>
      <ThemedText type="h4" style={styles.emptyTitle}>
        No Customers Yet
      </ThemedText>
      <ThemedText type="body" style={styles.emptyMessage}>
        Customers will appear here after bookings are made.
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          gap: Spacing.xl,
        }}
        data={customers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={customers.length > 0}
        ListEmptyComponent={!loading ? renderEmptyState : null}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  emptyMessage: {
    textAlign: "center",
    opacity: 0.6,
  },
});
