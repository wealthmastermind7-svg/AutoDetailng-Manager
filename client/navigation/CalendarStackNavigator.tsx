import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CalendarScreen from "@/screens/CalendarScreen";
import BookingDetailScreen from "@/screens/BookingDetailScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type CalendarStackParamList = {
  CalendarMain: undefined;
  BookingDetail: { bookingId: string };
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
        name="BookingDetail"
        component={BookingDetailScreen}
        options={{
          headerTitle: "Booking",
        }}
      />
    </Stack.Navigator>
  );
}
