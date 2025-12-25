import React, { useEffect } from "react";
import { View } from "react-native";
import { api } from "@/lib/api";
import { getApiUrl } from "@/lib/query-client";
import DashboardScreen from "@/screens/DashboardScreen";

export default function HomeScreen() {
  useEffect(() => {
    // Initialize demo data from backend on first load if needed
    (async () => {
      try {
        const businessId = api.getBusinessId();
        if (!businessId) return;

        // Check if business has services - if not, initialize demo data
        const services = await api.getServices();
        if (services.length === 0) {
          console.log("No services found, initializing demo data from backend...");
          // Call backend demo data endpoint
          await fetch(`${getApiUrl()}/api/businesses/${businessId}/demo-data`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ businessType: "salon" }),
          });
          console.log("Demo data initialized from backend");
        }
      } catch (error) {
        console.error("Error initializing demo data:", error);
        // Continue anyway - user can manually load demo data from Settings
      }
    })();
  }, []);

  return <DashboardScreen />;
}
