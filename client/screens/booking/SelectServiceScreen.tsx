import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { StorageService, Service } from "@/lib/storage";
import { ServiceCard } from "@/components/ServiceCard";
import { ThemedView } from "@/components/ThemedView";
import { BookingFlowParamList } from "@/navigation/BookingFlowNavigator";

type Navigation = NativeStackNavigationProp<BookingFlowParamList>;

export default function SelectServiceScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<Navigation>();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(false);
    try {
      const data = await StorageService.getServices();
      setServices(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectService = (serviceId: string) => {
    navigation.navigate("SelectTime", { serviceId });
  };

  const renderItem = ({ item }: { item: Service }) => (
    <ServiceCard
      name={item.name}
      duration={item.duration}
      price={item.price}
      compact
      onPress={() => handleSelectService(item.id)}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          gap: Spacing.xl,
        }}
        data={services}
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
