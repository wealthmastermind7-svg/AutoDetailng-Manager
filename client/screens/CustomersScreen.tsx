import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { api, Customer } from "@/lib/api";
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
    initializeBusiness();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (api.getBusinessId()) {
        loadCustomers();
      }
    }, [])
  );

  const initializeBusiness = async () => {
    try {
      await api.getOrCreateBusiness();
      loadCustomers();
    } catch (error) {
      console.error("Error initializing business:", error);
    }
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (error) {
      console.error("Error loading customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      customer.name,
      `Email: ${customer.email}\nPhone: ${customer.phone || "N/A"}\nTotal Bookings: ${customer.totalBookings || 0}`,
      [{ text: "Close", style: "default" }]
    );
  };

  const renderItem = ({ item }: { item: Customer }) => (
    <CustomerCard
      name={item.name}
      email={item.email}
      phone={item.phone || undefined}
      totalBookings={item.totalBookings || 0}
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
