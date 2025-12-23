import React, { useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { StorageService, Customer } from "@/lib/storage";
import { CustomerCard } from "@/components/CustomerCard";
import { ThemedView } from "@/components/ThemedView";

export default function CustomersScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadCustomers();
    }, [])
  );

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await StorageService.getCustomers();
      setCustomers(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCustomer = (customerId: string) => {
    // Navigate to customer detail
  };

  const renderItem = ({ item }: { item: Customer }) => (
    <CustomerCard
      name={item.name}
      email={item.email}
      phone={item.phone}
      totalBookings={item.totalBookings}
      onPress={() => handleSelectCustomer(item.id)}
    />
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
        scrollEnabled={!loading}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
