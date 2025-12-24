import React, { useState, useEffect } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { StorageService, Service, ServiceLink } from "@/lib/storage";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type EditScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ServiceEditor"
>;

export default function ServiceEditorScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const navigation = useNavigation<EditScreenNavigationProp>();
  const { theme } = useTheme();

  const [service, setService] = useState<Partial<Service>>({
    name: "",
    duration: 30,
    price: 0,
    description: "",
    links: [],
  });

  const [activeTab, setActiveTab] = useState<"details" | "links">("details");
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    category: "external" as const,
  });

  const serviceId = (route.params as any)?.serviceId;

  useEffect(() => {
    if (serviceId) {
      loadService();
    }
  }, [serviceId]);

  const loadService = async () => {
    if (serviceId) {
      const services = await StorageService.getServices();
      const found = services.find((s) => s.id === serviceId);
      if (found) {
        setService(found);
      }
    }
  };

  const handleSave = async () => {
    if (!service.name?.trim()) {
      alert("Please enter a service name");
      return;
    }

    if (service.duration === 0 || service.duration === undefined) {
      alert("Please set a duration");
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (serviceId) {
        await StorageService.updateService(serviceId, service as Service);
      } else {
        const newService: Service = {
          id: Date.now().toString(),
          name: service.name || "",
          duration: service.duration || 30,
          price: service.price || 0,
          description: service.description,
          links: service.links || [],
        };
        await StorageService.addService(newService);
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error saving service:", error);
      alert("Error saving service");
    }
  };

  const handleAddLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) {
      alert("Please fill in all link fields");
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const link: ServiceLink = {
        id: Date.now().toString(),
        title: newLink.title,
        url: newLink.url,
        category: newLink.category,
      };

      setService((prev) => ({
        ...prev,
        links: [...(prev.links || []), link],
      }));

      setNewLink({
        title: "",
        url: "",
        category: "external",
      });
    } catch (error) {
      console.error("Error adding link:", error);
    }
  };

  const handleRemoveLink = (linkId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setService((prev) => ({
      ...prev,
      links: (prev.links || []).filter((l) => l.id !== linkId),
    }));
  };

  const renderLinkCard = (link: ServiceLink) => (
    <View key={link.id} style={[styles.linkCard, { backgroundColor: theme.backgroundSecondary }]}>
      <View style={styles.linkContent}>
        <View style={styles.linkHeader}>
          <ThemedText type="h4" numberOfLines={1} style={{ flex: 1 }}>
            {link.title}
          </ThemedText>
          <Pressable
            onPress={() => handleRemoveLink(link.id)}
            style={styles.removeButton}
          >
            <Feather name="trash-2" size={18} color={theme.text} />
          </Pressable>
        </View>
        <ThemedText
          type="small"
          numberOfLines={2}
          style={[styles.linkUrl, { color: theme.link }]}
        >
          {link.url}
        </ThemedText>
        <View style={styles.categoryBadge}>
          <ThemedText
            type="small"
            style={[
              styles.categoryText,
              { color: theme.backgroundRoot },
            ]}
          >
            {link.category}
          </ThemedText>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
    >
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={{
          paddingBottom: insets.bottom + Spacing.xl,
        }}
      >
        {/* Tab Navigation */}
        <View style={[styles.tabBar, { borderBottomColor: theme.backgroundSecondary }]}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab("details");
            }}
            style={[
              styles.tab,
              activeTab === "details" && [
                styles.activeTab,
                { borderBottomColor: theme.text },
              ],
            ]}
          >
            <ThemedText
              type="body"
              style={[
                styles.tabText,
                activeTab === "details" && styles.activeTabText,
              ]}
            >
              Service Details
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab("links");
            }}
            style={[
              styles.tab,
              activeTab === "links" && [
                styles.activeTab,
                { borderBottomColor: theme.text },
              ],
            ]}
          >
            <ThemedText
              type="body"
              style={[
                styles.tabText,
                activeTab === "links" && styles.activeTabText,
              ]}
            >
              Links ({service.links?.length || 0})
            </ThemedText>
          </Pressable>
        </View>

        {/* Details Tab */}
        {activeTab === "details" && (
          <View style={styles.tabContent}>
            {/* Service Name */}
            <View style={styles.section}>
              <ThemedText type="h4" style={styles.sectionTitle}>
                Service Name
              </ThemedText>
              <TextInput
                value={service.name}
                onChangeText={(text) =>
                  setService((prev) => ({ ...prev, name: text }))
                }
                placeholder="Enter service name"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                    borderColor: theme.backgroundTertiary,
                  },
                ]}
              />
            </View>

            {/* Duration */}
            <View style={styles.section}>
              <ThemedText type="h4" style={styles.sectionTitle}>
                Duration (minutes)
              </ThemedText>
              <TextInput
                value={String(service.duration)}
                onChangeText={(text) =>
                  setService((prev) => ({
                    ...prev,
                    duration: parseInt(text) || 0,
                  }))
                }
                placeholder="30"
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                    borderColor: theme.backgroundTertiary,
                  },
                ]}
              />
            </View>

            {/* Price */}
            <View style={styles.section}>
              <ThemedText type="h4" style={styles.sectionTitle}>
                Price ($)
              </ThemedText>
              <TextInput
                value={String(service.price)}
                onChangeText={(text) =>
                  setService((prev) => ({
                    ...prev,
                    price: parseFloat(text) || 0,
                  }))
                }
                placeholder="0.00"
                placeholderTextColor={theme.textSecondary}
                keyboardType="decimal-pad"
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                    borderColor: theme.backgroundTertiary,
                  },
                ]}
              />
            </View>

            {/* Description */}
            <View style={styles.section}>
              <ThemedText type="h4" style={styles.sectionTitle}>
                Description
              </ThemedText>
              <TextInput
                value={service.description}
                onChangeText={(text) =>
                  setService((prev) => ({ ...prev, description: text }))
                }
                placeholder="Enter service description"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
                style={[
                  styles.input,
                  styles.descriptionInput,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                    borderColor: theme.backgroundTertiary,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Links Tab */}
        {activeTab === "links" && (
          <View style={styles.tabContent}>
            {/* Existing Links */}
            {service.links && service.links.length > 0 && (
              <View style={styles.section}>
                <ThemedText type="h4" style={styles.sectionTitle}>
                  Service Links
                </ThemedText>
                <View style={styles.linksList}>
                  {service.links.map((link) => renderLinkCard(link))}
                </View>
              </View>
            )}

            {/* Add New Link */}
            <View style={styles.section}>
              <ThemedText type="h4" style={styles.sectionTitle}>
                Add New Link
              </ThemedText>

              <TextInput
                value={newLink.title}
                onChangeText={(text) =>
                  setNewLink((prev) => ({ ...prev, title: text }))
                }
                placeholder="Link title (e.g., Gallery, Video)"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                    borderColor: theme.backgroundTertiary,
                  },
                ]}
              />

              <TextInput
                value={newLink.url}
                onChangeText={(text) =>
                  setNewLink((prev) => ({ ...prev, url: text }))
                }
                placeholder="URL (e.g., https://example.com)"
                placeholderTextColor={theme.textSecondary}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                    borderColor: theme.backgroundTertiary,
                  },
                ]}
              />

              {/* Category Selector */}
              <ThemedText type="small" style={styles.sectionTitle}>
                Category
              </ThemedText>
              <View style={styles.categorySelector}>
                {["gallery", "video", "external", "social"].map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setNewLink((prev) => ({
                        ...prev,
                        category: cat as any,
                      }));
                    }}
                    style={[
                      styles.categoryButton,
                      {
                        backgroundColor:
                          newLink.category === cat
                            ? theme.link
                            : theme.backgroundSecondary,
                      },
                    ]}
                  >
                    <ThemedText
                      type="small"
                      style={[
                        styles.categoryButtonText,
                        {
                          color:
                            newLink.category === cat
                              ? theme.buttonText
                              : theme.text,
                        },
                      ]}
                    >
                      {cat}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              <Pressable
                onPress={handleAddLink}
                style={[
                  styles.addLinkButton,
                  { backgroundColor: theme.link },
                ]}
              >
                <Feather name="plus" size={20} color={theme.buttonText} />
                <ThemedText
                  type="body"
                  style={[styles.addLinkButtonText, { color: theme.buttonText }]}
                >
                  Add Link
                </ThemedText>
              </Pressable>
            </View>

            {/* Empty State */}
            {(!service.links || service.links.length === 0) && (
              <View style={styles.emptyState}>
                <Feather name="link" size={40} color={theme.textSecondary} />
                <ThemedText type="body" style={styles.emptyStateText}>
                  No links yet. Add one to get started!
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View
          style={[
            styles.actionButtons,
            { paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
          ]}
        >
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
            style={[
              styles.cancelButton,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <ThemedText type="body" style={styles.cancelButtonText}>
              Cancel
            </ThemedText>
          </Pressable>

          <Button
            onPress={handleSave}
            style={{ flex: 1, marginLeft: Spacing.md }}
          >
            Save Service
          </Button>
        </View>
      </KeyboardAwareScrollViewCompat>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: Spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.lg,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    opacity: 0.6,
    fontWeight: "500",
  },
  activeTabText: {
    opacity: 1,
    fontWeight: "600",
  },
  tabContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  descriptionInput: {
    textAlignVertical: "top",
    minHeight: 100,
  },
  categorySelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  categoryButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  categoryButtonText: {
    fontWeight: "500",
  },
  linksList: {
    gap: Spacing.md,
  },
  linkCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  linkContent: {
    gap: Spacing.sm,
  },
  linkHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  linkUrl: {
    opacity: 0.7,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#7B68EE",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  categoryText: {
    fontWeight: "500",
    fontSize: 12,
  },
  removeButton: {
    padding: Spacing.sm,
  },
  addLinkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  addLinkButtonText: {
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.md,
  },
  emptyStateText: {
    opacity: 0.6,
    marginTop: Spacing.md,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  cancelButton: {
    flex: 1,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontWeight: "600",
  },
});
