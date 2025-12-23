import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { StorageService } from "@/lib/storage";
import { SettingsRow } from "@/components/SettingsRow";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";

interface BusinessSettings {
  businessName: string;
  website: string;
  phone: string;
}

export default function SettingsScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    businessName: "BookFlow",
    website: "bookflow.app",
    phone: "+1 (555) 123-4567",
  });
  const [loading, setLoading] = useState(false);
  const [demoDataLoading, setDemoDataLoading] = useState(false);
  const [clearDataLoading, setClearDataLoading] = useState(false);

  useEffect(() => {
    initializeDataIfNeeded();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadSettings();
    }, [])
  );

  const initializeDataIfNeeded = async () => {
    try {
      const existingBookings = await StorageService.getBookings();
      if (existingBookings.length === 0) {
        await StorageService.initializeDemoData();
      }
    } catch (error) {
      console.error("Error initializing data:", error);
    }
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const settings = await StorageService.getBusinessSettings();
      if (settings) {
        setBusinessSettings(settings);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "This will delete all services, bookings, and customers. This action cannot be undone.",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Clear",
          onPress: async () => {
            setClearDataLoading(true);
            try {
              await StorageService.clearAllData();
              setBusinessSettings({
                businessName: "BookFlow",
                website: "bookflow.app",
                phone: "+1 (555) 123-4567",
              });
              Alert.alert("Success", "All data has been cleared");
            } catch (error) {
              console.error("Error clearing data:", error);
              Alert.alert("Error", "Failed to clear data. Please try again.");
            } finally {
              setClearDataLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleInitializeDemoData = async () => {
    setDemoDataLoading(true);
    try {
      await StorageService.initializeDemoData();
      Alert.alert("Success", "Demo data has been initialized");
    } catch (error) {
      console.error("Error initializing demo data:", error);
      Alert.alert("Error", "Failed to load demo data. Please try again.");
    } finally {
      setDemoDataLoading(false);
    }
  };

  const settingsItems = [
    {
      section: "Business Settings",
      items: [
        {
          icon: "briefcase" as const,
          title: "Business Name",
          subtitle: "Your business name",
          value: businessSettings.businessName,
        },
        {
          icon: "globe" as const,
          title: "Website",
          subtitle: "Your business website",
          value: businessSettings.website,
        },
        {
          icon: "phone" as const,
          title: "Phone",
          subtitle: "Contact number",
          value: businessSettings.phone,
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
          disabled: demoDataLoading,
        },
        {
          icon: "trash-2" as const,
          title: "Clear All Data",
          subtitle: "Delete all services, bookings, and customers",
          onPress: handleClearAllData,
          destructive: true,
          disabled: clearDataLoading,
        },
      ],
    },
  ];

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
            {section.items.map((item: any, idx: number) => (
              <View key={idx} style={idx < section.items.length - 1 ? styles.itemGap : {}}>
                <SettingsRow
                  icon={item.icon}
                  title={item.title}
                  subtitle={item.subtitle}
                  value={item.value}
                  hasToggle={item.hasToggle}
                  toggleValue={item.toggleValue}
                  onToggle={item.onToggle}
                  onPress={!item.disabled ? item.onPress : undefined}
                  destructive={item.destructive}
                  disabled={item.disabled}
                />
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
