import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SelectServiceScreen from "@/screens/booking/SelectServiceScreen";
import SelectTimeScreen from "@/screens/booking/SelectTimeScreen";
import CheckoutScreen from "@/screens/booking/CheckoutScreen";
import ConfirmationScreen from "@/screens/booking/ConfirmationScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type BookingFlowParamList = {
  SelectService: undefined;
  SelectTime: { serviceId: string };
  Checkout: { serviceId: string; timeSlotId: string };
  Confirmation: { bookingId: string };
};

const Stack = createNativeStackNavigator<BookingFlowParamList>();

export default function BookingFlowNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="SelectService"
        component={SelectServiceScreen}
        options={{
          headerTitle: "Book Now",
        }}
      />
      <Stack.Screen
        name="SelectTime"
        component={SelectTimeScreen}
        options={{
          headerTitle: "Select Time",
        }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{
          headerTitle: "Confirm Booking",
        }}
      />
      <Stack.Screen
        name="Confirmation"
        component={ConfirmationScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
