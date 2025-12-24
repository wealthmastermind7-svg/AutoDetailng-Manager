import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, Alert, Share, Platform, Modal, Pressable, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { api, Business } from "@/lib/api";
import { SettingsRow } from "@/components/SettingsRow";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";

export default function SettingsScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoDataLoading, setDemoDataLoading] = useState(false);
  const [clearDataLoading, setClearDataLoading] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [bookingUrl, setBookingUrl] = useState<string>("");

  useEffect(() => {
    initializeBusiness();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (api.getBusinessId()) {
        loadSettings();
      }
    }, [])
  );

  const initializeBusiness = async () => {
    try {
      const biz = await api.getOrCreateBusiness();
      setBusiness(biz);
    } catch (error) {
      console.error("Error initializing business:", error);
    }
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const biz = await api.getBusiness();
      if (biz) {
        setBusiness(biz);
        setNotificationsEnabled(biz.notificationsEnabled ?? true);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              await api.clearAllData();
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDemoDataLoading(true);
    try {
      await api.initializeDemoData();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert("Success", "Demo data has been initialized");
    } catch (error) {
      console.error("Error initializing demo data:", error);
      Alert.alert("Error", "Failed to load demo data. Please try again.");
    } finally {
      setDemoDataLoading(false);
    }
  };

  const handleShareBookingLink = async () => {
    if (!business) return;
    const domain = process.env.EXPO_PUBLIC_DOMAIN || "bookflow.app";
    const cleanDomain = domain.replace(/^https?:\/\//, '');
    const bookingLink = `https://${cleanDomain}/book/${business.slug}`;
    try {
      await Share.share({
        message: `Book an appointment:\n${cleanDomain}/book/${business.slug}\n\nVisit to schedule with ${business.name}`,
        url: bookingLink,
        title: `${business.name} - Booking`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleShowQRCode = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const data = await api.getQRCode();
      if (data) {
        setQrCode(data.qrCode);
        setBookingUrl(data.bookingUrl);
        setQrModalVisible(true);
      } else {
        Alert.alert("Error", "Could not generate QR code");
      }
    } catch (error) {
      console.error("Error getting QR code:", error);
      Alert.alert("Error", "Failed to generate QR code");
    }
  };

  const handleDownloadQRCode = async () => {
    if (!business) return;
    try {
      const cleanDomain = (process.env.EXPO_PUBLIC_DOMAIN || "bookflow.app").replace(/^https?:\/\//, '');
      const qrImageUrl = `/api/businesses/${business.id}/qrcode?format=image`;
      const fullUrl = `https://${cleanDomain}${qrImageUrl}`;
      await Share.share({
        url: fullUrl,
        message: `Share this QR code to book appointments with ${business.name}\n\nVanity link: ${cleanDomain}/book/${business.slug}`,
        title: `${business.name} - Booking QR Code`,
      });
    } catch (error) {
      console.error("Error sharing QR code:", error);
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
          value: business?.name || "My Business",
        },
        {
          icon: "globe" as const,
          title: "Website",
          subtitle: "Your business website",
          value: business?.website || "Not set",
        },
        {
          icon: "phone" as const,
          title: "Phone",
          subtitle: "Contact number",
          value: business?.phone || "Not set",
        },
      ],
    },
    {
      section: "Booking Link",
      items: [
        {
          icon: "link" as const,
          title: "Share Booking Link",
          subtitle: business ? `${(process.env.EXPO_PUBLIC_DOMAIN || "bookflow.app").replace(/^https?:\/\//, '')}/book/${business.slug}` : "Generate your booking link",
          onPress: handleShareBookingLink,
          showChevron: true,
        },
        {
          icon: "grid" as const,
          title: "Show QR Code",
          subtitle: "Display QR code for customers to scan",
          onPress: handleShowQRCode,
          showChevron: true,
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

      <Modal
        visible={qrModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Booking QR Code</ThemedText>
              <Pressable onPress={() => setQrModalVisible(false)} style={styles.closeButton}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            
            {qrCode ? (
              <View style={styles.qrContainer}>
                <Image
                  source={{ uri: qrCode }}
                  style={styles.qrImage}
                  contentFit="contain"
                />
                <ThemedText type="small" style={styles.qrUrl}>
                  {bookingUrl}
                </ThemedText>
              </View>
            ) : null}
            
            <View style={styles.modalActions}>
              <Button onPress={handleDownloadQRCode}>
                Share QR Code Image
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    maxWidth: 360,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  qrImage: {
    width: 250,
    height: 250,
    marginBottom: Spacing.md,
  },
  qrUrl: {
    textAlign: "center",
    opacity: 0.7,
  },
  modalActions: {
    gap: Spacing.md,
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
