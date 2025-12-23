import React from "react";
import { View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";

export default function ProfileScreen() {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundRoot, alignItems: "center", justifyContent: "center" }}>
      <ThemedText type="body">Profile</ThemedText>
    </View>
  );
}
