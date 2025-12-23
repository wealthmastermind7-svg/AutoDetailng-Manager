import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

export default function ServiceEditorScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.backgroundRoot,
        paddingTop: Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: theme.text }}>Service Editor Placeholder</Text>
    </View>
  );
}
