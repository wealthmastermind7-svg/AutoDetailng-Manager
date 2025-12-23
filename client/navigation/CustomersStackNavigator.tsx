import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CustomersScreen from "@/screens/CustomersScreen";
import CustomerDetailScreen from "@/screens/CustomerDetailScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type CustomersStackParamList = {
  CustomersList: undefined;
  CustomerDetail: { customerId: string };
};

const Stack = createNativeStackNavigator<CustomersStackParamList>();

export default function CustomersStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="CustomersList"
        component={CustomersScreen}
        options={{
          headerTitle: "Customers",
        }}
      />
      <Stack.Screen
        name="CustomerDetail"
        component={CustomerDetailScreen}
        options={{
          headerTitle: "Customer",
        }}
      />
    </Stack.Navigator>
  );
}
