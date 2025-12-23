import React, { useState } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { StorageService } from "@/lib/storage";
import { SettingsRow } from "@/components/SettingsRow";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";

export default function SettingsScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleClearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "This will delete all services, bookings, and customers. This action cannot be undone.",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Clear",
          onPress: async () => {
            await StorageService.clearAllData();
            Alert.alert("Success", "All data has been cleared");
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleInitializeDemoData = async () => {
    await StorageService.initializeDemoData();
    Alert.alert("Success", "Demo data has been initialized");
  };

  const settingsItems = [
    {
      section: "Business Settings",
      items: [
        {
          icon: "briefcase" as const,
          title: "Business Name",
          subtitle: "Your business name",
          value: "BookFlow",
        },
        {
          icon: "globe" as const,
          title: "Website",
          subtitle: "Your business website",
          value: "bookflow.app",
        },
        {
          icon: "phone" as const,
          title: "Phone",
          subtitle: "Contact number",
          value: "+1 (555) 123-4567",
        },
      ],
    },
    {
      section: "Notifications",
      items: [
        {
          icon: "bell" as const,
          title: "Enable Notifications",
          hasToggle: true,
          toggleValue: notificationsEnabled,
          onToggle: (value: boolean) => setNotificationsEnabled(value),
        },
      ],
    },
    {
      section: "Data Management",
      items: [
        {
          icon: "refresh-cw" as const,
          title: "Load Demo Data",
          subtitle: "Populate app with sample data",
          onPress: handleInitializeDemoData,
        },
        {
          icon: "trash-2" as const,
          title: "Clear All Data",
          subtitle: "Delete all services, bookings, and customers",
          onPress: handleClearAllData,
          destructive: true,
        },
      ],
    },
  ];

  const renderItem = ({
    item,
  }: {
    item: (typeof settingsItems)[0]["items"][0];
  }) => (
    <SettingsRow
      icon={item.icon}
      title={item.title}
      subtitle={item.subtitle}
      value={item.value}
      hasToggle={item.hasToggle}
      toggleValue={item.toggleValue}
      onToggle={item.onToggle}
      onPress={item.onPress}
      destructive={item.destructive}
    />
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        scrollEnabled={true}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        data={settingsItems}
        renderItem={({ item: section }) => (
          <View key={section.section} style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              {section.section}
            </ThemedText>
            {section.items.map((item, idx) => (
              <View key={idx} style={idx < section.items.length - 1 ? styles.itemGap : {}}>
                <renderItem item={item} />
              </View>
            ))}
          </View>
        )}
        keyExtractor={(item) => item.section}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing["3xl"],
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  itemGap: {
    marginBottom: Spacing.lg,
  },
});
