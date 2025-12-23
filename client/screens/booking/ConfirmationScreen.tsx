import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

export default function ConfirmationScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.backgroundRoot,
        paddingTop: insets.top + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: theme.text }}>Confirmation Placeholder</Text>
    </View>
  );
}
