import React, { useEffect } from "react";
import { View } from "react-native";
import { StorageService } from "@/lib/storage";
import DashboardScreen from "@/screens/DashboardScreen";

export default function HomeScreen() {
  useEffect(() => {
    // Initialize demo data on first load
    StorageService.initializeDemoData();
  }, []);

  return <DashboardScreen />;
}
