import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import BookingFlowNavigator from "@/navigation/BookingFlowNavigator";
import ServiceEditorScreen from "@/screens/ServiceEditorScreen";
import OnboardingScreen from "@/screens/OnboardingScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useOnboarding } from "@/hooks/useOnboarding";
import { HeaderButton } from "@react-navigation/elements";
import { useTheme } from "@/hooks/useTheme";

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  BookingFlow: undefined;
  ServiceEditor: { serviceId?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const opaqueScreenOptions = useScreenOptions({ transparent: false });
  const { theme } = useTheme();
  const { isLoading, hasCompletedOnboarding, completeOnboarding } = useOnboarding();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={screenOptions}
      initialRouteName={hasCompletedOnboarding ? "Main" : "Onboarding"}
    >
      <Stack.Screen
        name="Onboarding"
        options={{ headerShown: false, animation: "fade" }}
      >
        {(props) => (
          <OnboardingScreen
            {...props}
            onComplete={() => {
              completeOnboarding();
              props.navigation.reset({
                index: 0,
                routes: [{ name: "Main" }],
              });
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BookingFlow"
        component={BookingFlowNavigator}
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="ServiceEditor"
        component={ServiceEditorScreen}
        options={({ navigation, route }) => ({
          ...opaqueScreenOptions,
          presentation: "modal",
          headerTitle: route.params?.serviceId ? "Edit Service" : "New Service",
          headerLeft: () => (
            <HeaderButton onPress={() => navigation.goBack()}>
              Cancel
            </HeaderButton>
          ),
          headerRight: () => (
            <HeaderButton
              onPress={() => {}}
              tintColor={theme.accent}
            >
              Save
            </HeaderButton>
          ),
        })}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
});
