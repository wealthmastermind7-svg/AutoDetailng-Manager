import React, { useState } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { StorageService, Service } from "@/lib/storage";
import { ServiceCard } from "@/components/ServiceCard";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { ThemedView } from "@/components/ThemedView";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type Navigation = NativeStackNavigationProp<RootStackParamList>;

export default function ServicesScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<Navigation>();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadServices();
    }, [])
  );

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await StorageService.getServices();
      setServices(data);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateService = () => {
    navigation.navigate("ServiceEditor");
  };

  const handleSelectService = (serviceId: string) => {
    navigation.navigate("ServiceEditor", { serviceId });
  };

  const renderItem = ({ item }: { item: Service }) => (
    <ServiceCard
      name={item.name}
      duration={item.duration}
      price={item.price}
      bookingRate={Math.floor(Math.random() * 100)}
      onPress={() => handleSelectService(item.id)}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl + 80,
          paddingHorizontal: Spacing.lg,
          gap: Spacing.xl,
        }}
        data={services}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={!loading}
      />
      <FloatingActionButton
        icon="plus"
        onPress={handleCreateService}
        style={{
          position: "absolute",
          right: Spacing.xl,
          bottom: tabBarHeight + Spacing.xl,
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
