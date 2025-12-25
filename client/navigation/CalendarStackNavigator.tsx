import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CalendarScreen from "@/screens/CalendarScreen";
import AvailabilityEditorScreen from "@/screens/AvailabilityEditorScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type CalendarStackParamList = {
  CalendarMain: undefined;
  AvailabilityEditor: undefined;
};

const Stack = createNativeStackNavigator<CalendarStackParamList>();

export default function CalendarStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="CalendarMain"
        component={CalendarScreen}
        options={{
          headerTitle: "Calendar",
        }}
      />
      <Stack.Screen
        name="AvailabilityEditor"
        component={AvailabilityEditorScreen}
        options={{
          headerTitle: "Business Hours",
        }}
      />
    </Stack.Navigator>
  );
}
