import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * Gets the base URL for the Express API server (e.g., "http://localhost:3000")
 * @returns {string} The API base URL
 */
export function getApiUrl(): string {
  // In browser, check window.location first
  if (typeof window !== "undefined" && window.location) {
    const currentHost = window.location.hostname;
    const currentProtocol = window.location.protocol;
    
    // If running on Replit domain, use port 5000 on the same host
    if (currentHost.includes("replit.dev") || currentHost.includes("replit.app")) {
      return `${currentProtocol}//${currentHost}:5000/`;
    }
    
    // If running on custom production domain
    if (currentHost.includes("cerolauto.store")) {
      return `${currentProtocol}//${currentHost}/`;
    }
    
    // Local development - use localhost:5000
    if (currentHost === "localhost" || currentHost === "127.0.0.1") {
      return "http://localhost:5000/";
    }
  }

  // For Expo Go (native) - try to use EXPO_PUBLIC_DOMAIN first
  let host = process.env.EXPO_PUBLIC_DOMAIN || "";
  
  // Handle case where env var contains literal $REPLIT_DEV_DOMAIN (not interpolated)
  if (host.includes("$REPLIT_DEV_DOMAIN")) {
    // For native Expo Go, construct domain from packager hostname if available
    const packagerHostname = process.env.REACT_NATIVE_PACKAGER_HOSTNAME;
    if (packagerHostname && !packagerHostname.includes("$")) {
      host = `${packagerHostname}:5000`;
    } else {
      // Try common Replit domain pattern
      host = "localhost:5000"; // Fallback for local dev
    }
  }

  // If still no host, try to get from app config (for TestFlight production builds)
  if (!host) {
    try {
      const Constants = require("expo-constants").default;
      host = Constants?.expoConfig?.extra?.apiDomain || "";
    } catch (e) {
      // Silently fail if Constants not available
    }
  }

  // Final fallback
  if (!host) {
    host = "localhost:5000";
  }

  // Check if host already has a protocol
  let url: URL;
  if (host.startsWith("http://") || host.startsWith("https://")) {
    url = new URL(host);
  } else {
    // Assume https for production domains, http for localhost
    const protocol = host.includes("localhost") ? "http" : "https";
    url = new URL(`${protocol}://${host}`);
  }

  return url.href;
}

/**
 * Gets the public booking domain (clean domain without protocol)
 * Used for generating public booking URLs and QR codes
 * @returns {string} The clean domain (e.g., "bookflowx.cerolauto.store")
 */
export function getBookingDomain(): string {
  // In browser, check window.location first (this is the most reliable)
  if (typeof window !== "undefined" && window.location) {
    const currentHost = window.location.hostname;
    
    // If running on Replit domain, use localhost for development
    if (currentHost.includes("replit.dev") || currentHost.includes("replit.app")) {
      return "localhost:5000";
    }
    
    // If running on custom production domain or localhost, use it
    if (currentHost.includes("cerolauto.store") || currentHost === "localhost" || currentHost === "127.0.0.1") {
      // For production domain, just use the domain
      if (currentHost.includes("cerolauto.store")) {
        return currentHost;
      }
      // For localhost, include port
      return currentHost === "localhost" ? "localhost:5000" : currentHost;
    }
  }

  // For native Expo (TestFlight/Expo Go) - use environment variable or app config
  let domain = process.env.EXPO_PUBLIC_DOMAIN || "";

  // Handle literal template strings
  if (domain.includes("$REPLIT_DEV_DOMAIN") || domain === "") {
    // Try to get from app config (for TestFlight production builds)
    try {
      const Constants = require("expo-constants").default;
      domain = Constants?.expoConfig?.extra?.apiDomain || "localhost:5000";
    } catch (e) {
      domain = "localhost:5000";
    }
  }

  // Strip any protocol if present
  return domain.replace(/^https?:\/\//, "");
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  route: string,
  data?: unknown | undefined,
): Promise<Response> {
  const baseUrl = getApiUrl();
  const url = new URL(route, baseUrl);

  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const baseUrl = getApiUrl();
    const url = new URL(queryKey.join("/") as string, baseUrl);

    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
