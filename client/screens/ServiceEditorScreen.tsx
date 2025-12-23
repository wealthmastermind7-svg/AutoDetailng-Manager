import React, { useState, useEffect } from "react";
import { View, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { StorageService, Service } from "@/lib/storage";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type EditScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "ServiceEditor">;

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

    try {
      if (serviceId) {
        await StorageService.updateService(serviceId, service as Service);
      } else {
        const newService: Service = {
          id: Date.now().toString(),
          name: service.name || "",
          duration: service.duration || 30,
          price: service.price || 0,
          description: service.description,
        };
        await StorageService.addService(newService);
      }
      navigation.goBack();
    } catch (error) {
      console.error("Error saving service:", error);
      alert("Error saving service");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
    >
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={{
          paddingTop: Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
      >
        <ThemedText type="h4" style={styles.placeholder}>
          Service Editor
        </ThemedText>
        <ThemedText type="body" style={styles.placeholderText}>
          Edit service details here (form to be implemented)
        </ThemedText>
      </KeyboardAwareScrollViewCompat>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  placeholder: {
    marginBottom: Spacing.lg,
  },
  placeholderText: {
    opacity: 0.6,
  },
});
