import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, Alert, Share, Platform, Modal, Pressable, ActivityIndicator, TextInput, Linking } from "react-native";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { api, Business } from "@/lib/api";
import { getBookingDomain } from "@/lib/query-client";
import { SettingsRow } from "@/components/SettingsRow";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { 
  getNotificationPermissionStatus, 
  requestNotificationPermissions, 
  registerPushToken, 
  unregisterPushToken,
  NotificationPermissionStatus 
} from "@/lib/notifications";
import { getApiUrl } from "@/lib/query-client";

export default function SettingsScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermissionStatus | null>(null);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoDataLoading, setDemoDataLoading] = useState(false);
  const [clearDataLoading, setClearDataLoading] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [bookingUrl, setBookingUrl] = useState<string>("");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<"name" | "website" | "phone" | null>(null);
  const [editValue, setEditValue] = useState("");
  const [demoTypeModalVisible, setDemoTypeModalVisible] = useState(false);
  const [selectedDemoType, setSelectedDemoType] = useState<string>("salon");

  const DEMO_TYPES = [
    { id: "salon", label: "Salon", description: "Hair & beauty services" },
    { id: "autodetailing", label: "Auto Detailing", description: "Car detailing services" },
    { id: "solar", label: "Solar Installation", description: "Solar energy services" },
    { id: "coaching", label: "Coaching", description: "Personal & executive coaching" },
    { id: "fitness", label: "Fitness", description: "Gym & fitness training" },
  ];

  useEffect(() => {
    initializeBusiness();
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    if (Platform.OS === 'web') {
      setNotificationPermission({ granted: false, canAskAgain: false, status: 'denied' });
      return;
    }
    const status = await getNotificationPermissionStatus();
    setNotificationPermission(status);
    setNotificationsEnabled(status.granted && (business?.notificationsEnabled ?? false));
  };

  useFocusEffect(
    React.useCallback(() => {
      const bidSync = api.getBusinessId();
      if (bidSync) {
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
        const permStatus = await getNotificationPermissionStatus();
        setNotificationPermission(permStatus);
        setNotificationsEnabled(permStatus.granted && (biz.notificationsEnabled ?? false));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (!business) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotificationLoading(true);

    try {
      if (enabled) {
        if (Platform.OS === 'web') {
          Alert.alert(
            "Not Available",
            "Push notifications are not available on web. Please use the Expo Go app on your mobile device."
          );
          setNotificationLoading(false);
          return;
        }

        const permStatus = await requestNotificationPermissions();
        setNotificationPermission(permStatus);

        if (!permStatus.granted) {
          if (!permStatus.canAskAgain) {
            Alert.alert(
              "Permission Required",
              "Please enable notifications in your device settings to receive booking alerts.",
[
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Open Settings", 
                  onPress: async () => {
                    try {
                      await Linking.openSettings();
                    } catch (error) {
                      console.error("Could not open settings:", error);
                    }
                  }
                }
              ]
            );
          }
          setNotificationLoading(false);
          return;
        }

        const registered = await registerPushToken(business.id);
        if (!registered) {
          Alert.alert("Error", "Failed to register for notifications. Please try again.");
          setNotificationLoading(false);
          return;
        }

        await api.updateBusiness({ notificationsEnabled: true });
        setNotificationsEnabled(true);
        setBusiness({ ...business, notificationsEnabled: true });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Success", "Notifications enabled. You will be notified when customers book appointments.");
      } else {
        await unregisterPushToken(business.id);
        await api.updateBusiness({ notificationsEnabled: false });
        setNotificationsEnabled(false);
        setBusiness({ ...business, notificationsEnabled: false });
      }
    } catch (error) {
      console.error("Error toggling notifications:", error);
      Alert.alert("Error", "Failed to update notification settings. Please try again.");
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleTestNotification = async () => {
    if (!business) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const response = await fetch(new URL(`/api/businesses/${business.id}/test-notification`, getApiUrl()).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (result.success && result.sentCount > 0) {
        Alert.alert("Test Sent", "A test notification has been sent to your device.");
      } else if (result.sentCount === 0) {
        Alert.alert("No Devices", "No devices are registered for notifications. Make sure you've enabled notifications on a mobile device.");
      } else {
        Alert.alert("Error", result.errors?.join(", ") || "Failed to send test notification.");
      }
    } catch (error) {
      console.error("Error sending test notification:", error);
      Alert.alert("Error", "Failed to send test notification. Please try again.");
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
              Alert.alert("Success", "All data has been cleared", 
                [{ text: "OK", onPress: () => navigation.navigate("DashboardTab" as any) }] as any
              );
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

  const handleInitializeDemoData = async (businessType: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDemoDataLoading(true);
    setDemoTypeModalVisible(false);
    try {
      await api.initializeDemoData(businessType);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const businessLabel = DEMO_TYPES.find(t => t.id === businessType)?.label;
      Alert.alert("Success", `Demo data for ${businessLabel} has been loaded`,
        [{ text: "View Dashboard", onPress: () => navigation.navigate("DashboardTab" as any) }] as any
      );
    } catch (error) {
      console.error("Error initializing demo data:", error);
      Alert.alert("Error", "Failed to load demo data. Please try again.");
    } finally {
      setDemoDataLoading(false);
    }
  };

  const handleShowDemoTypeModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDemoTypeModalVisible(true);
  };

  const handleShareBookingLink = async () => {
    if (!business) return;
    const bookingLink = business.bookingUrl || `https://${getBookingDomain()}/book/${business.slug}`;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await Share.share({
        message: `Book an appointment:\n${bookingLink}\n\nVisit to schedule with ${business.name}`,
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
      const cleanDomain = getBookingDomain();
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

  const handleEditBusinessField = (field: "name" | "website" | "phone") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEditingField(field);
    const currentValue = business?.[field as keyof Business];
    setEditValue(currentValue ? String(currentValue) : "");
    setEditModalVisible(true);
  };

  const handleSaveBusinessField = async () => {
    if (!business || !editingField) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const updates: Partial<Business> = { [editingField]: editValue };
      const updated = await api.updateBusiness(updates);
      setBusiness(updated);
      setEditModalVisible(false);
      setEditingField(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Error updating business:", error);
      Alert.alert("Error", "Failed to update business information");
    }
  };

  const settingsItems = [
    {
      section: "Business Settings",
      items: [
        {
          icon: "briefcase" as const,
          title: "Business Name",
          subtitle: "Tap to edit",
          value: business?.name || "My Business",
          onPress: () => handleEditBusinessField("name"),
          showChevron: true,
        },
        {
          icon: "globe" as const,
          title: "Website",
          subtitle: "Tap to edit",
          value: business?.website || "Not set",
          onPress: () => handleEditBusinessField("website"),
          showChevron: true,
        },
        {
          icon: "phone" as const,
          title: "Phone",
          subtitle: "Tap to edit",
          value: business?.phone || "Not set",
          onPress: () => handleEditBusinessField("phone"),
          showChevron: true,
        },
      ],
    },
    {
      section: "Booking Link",
      items: [
        {
          icon: "link" as const,
          title: "Share Booking Link",
          subtitle: business?.bookingUrl || `${getBookingDomain()}/book/${business?.slug}`,
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
          subtitle: Platform.OS === 'web' 
            ? "Use Expo Go on mobile for notifications" 
            : notificationsEnabled 
              ? "Receive alerts for new bookings" 
              : "Get notified when customers book",
          hasToggle: true,
          toggleValue: notificationsEnabled,
          onToggle: handleNotificationToggle,
          disabled: notificationLoading || Platform.OS === 'web',
        },
        {
          icon: "send" as const,
          title: "Send Test Notification",
          subtitle: "Verify notifications are working",
          onPress: handleTestNotification,
          showChevron: true,
          disabled: !notificationsEnabled || Platform.OS === 'web',
        },
      ],
    },
    {
      section: "Data Management",
      items: [
        {
          icon: "refresh-cw" as const,
          title: "Load Demo Data",
          subtitle: "Choose business type to showcase",
          onPress: handleShowDemoTypeModal,
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
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">
                {editingField === "name" && "Business Name"}
                {editingField === "website" && "Website"}
                {editingField === "phone" && "Phone"}
              </ThemedText>
              <Pressable onPress={() => setEditModalVisible(false)} style={styles.closeButton}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            <TextInput
              value={editValue}
              onChangeText={setEditValue}
              placeholder={editingField === "name" ? "Business name" : editingField === "website" ? "Website URL" : "Phone number"}
              style={[
                styles.editInput,
                { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.backgroundTertiary }
              ]}
              placeholderTextColor={theme.textSecondary}
            />
            <View style={styles.modalActions}>
              <Button onPress={handleSaveBusinessField}>Save</Button>
            </View>
          </View>
        </View>
      </Modal>

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

      <Modal
        visible={demoTypeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDemoTypeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault, maxWidth: 400 }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Select Business Type</ThemedText>
              <Pressable onPress={() => setDemoTypeModalVisible(false)} style={styles.closeButton}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            
            <View style={styles.demoTypeGrid}>
              {DEMO_TYPES.map((type) => (
                <Pressable
                  key={type.id}
                  onPress={() => {
                    setSelectedDemoType(type.id);
                    handleInitializeDemoData(type.id);
                  }}
                  style={[
                    styles.demoTypeButton,
                    { backgroundColor: theme.backgroundSecondary }
                  ]}
                >
                  <ThemedText type="body" style={styles.demoTypeLabel}>
                    {type.label}
                  </ThemedText>
                  <ThemedText type="small" style={styles.demoTypeDescription}>
                    {type.description}
                  </ThemedText>
                </Pressable>
              ))}
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
  editInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    fontSize: 16,
  },
  demoTypeGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  demoTypeButton: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  demoTypeLabel: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  demoTypeDescription: {
    opacity: 0.6,
  },
});
