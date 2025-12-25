import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiUrl } from "./query-client";

const BUSINESS_ID_KEY = "bookflow_business_id";

function getApiBase(): string {
  return getApiUrl();
}

async function makeRequest<T>(
  method: string,
  path: string,
  data?: unknown
): Promise<T> {
  const url = new URL(path, getApiBase());
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  timezone?: string | null;
  notificationsEnabled?: boolean | null;
  bookingUrl?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description?: string | null;
  duration: number;
  price: number;
  isActive?: boolean | null;
  createdAt?: string | null;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  email: string;
  phone?: string | null;
  totalBookings?: number | null;
  createdAt?: string | null;
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  businessId: string;
  customerId: string;
  serviceId: string;
  date: string;
  time: string;
  status: string;
  totalPrice: number;
  notes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  customerName?: string;
  serviceName?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  totalCustomers: number;
  totalServices: number;
  todayBookings: number;
  weeklyData: { day: string; revenue: number }[];
  recentBookings: Booking[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Availability {
  id: string;
  businessId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface AvailabilitySchedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

class ApiClient {
  private businessId: string | null = null;

  setBusinessId(id: string) {
    this.businessId = id;
    AsyncStorage.setItem(BUSINESS_ID_KEY, id).catch(console.error);
  }

  getBusinessId(): string | null {
    return this.businessId;
  }

  async loadBusinessId(): Promise<string | null> {
    if (this.businessId) return this.businessId;
    try {
      const saved = await AsyncStorage.getItem(BUSINESS_ID_KEY);
      if (saved) {
        this.businessId = saved;
      }
      return saved;
    } catch {
      return null;
    }
  }

  private getBusinessPath(): string {
    if (!this.businessId) {
      throw new Error("Business ID not set. Call setBusinessId first.");
    }
    return `/api/businesses/${this.businessId}`;
  }

  async getOrCreateBusiness(): Promise<Business> {
    try {
      const res = await fetch(`${getApiBase()}api/businesses/demo-business`);
      if (res.ok) {
        const business = await res.json();
        this.setBusinessId(business.id);
        return business;
      }
    } catch (error) {
      console.log("Demo business not found, creating...");
    }

    try {
      const newBusiness = await makeRequest<Business>("POST", "/api/businesses", {
        name: "My Business",
        slug: "demo-business",
        description: "Demo business for testing",
        phone: "+1 (555) 123-4567",
        email: "demo@bookflow.app",
      });
      this.setBusinessId(newBusiness.id);
      return newBusiness;
    } catch (error) {
      try {
        const res = await fetch(`${getApiBase()}api/businesses/demo-business`);
        if (res.ok) {
          const business = await res.json();
          this.setBusinessId(business.id);
          return business;
        }
      } catch {}
      throw error;
    }
  }

  async getBusiness(): Promise<Business | null> {
    if (!this.businessId) return null;
    try {
      const res = await fetch(`${getApiBase()}api/businesses/${this.businessId}`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }

  async updateBusiness(updates: Partial<Business>): Promise<Business> {
    return makeRequest<Business>("PATCH", `/api/businesses/${this.businessId}`, updates);
  }

  async getServices(): Promise<Service[]> {
    try {
      const res = await fetch(`${getApiBase()}${this.getBusinessPath()}/services`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  }

  async getService(id: string): Promise<Service | null> {
    try {
      const res = await fetch(`${getApiBase()}api/services/${id}`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }

  async createService(service: Omit<Service, "id" | "businessId" | "createdAt">): Promise<Service> {
    return makeRequest<Service>("POST", `${this.getBusinessPath()}/services`, service);
  }

  async updateService(id: string, updates: Partial<Service>): Promise<Service> {
    return makeRequest<Service>("PATCH", `/api/services/${id}`, updates);
  }

  async deleteService(id: string): Promise<void> {
    await makeRequest<void>("DELETE", `/api/services/${id}`);
  }

  async getCustomers(): Promise<Customer[]> {
    try {
      const res = await fetch(`${getApiBase()}${this.getBusinessPath()}/customers`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  }

  async getCustomer(id: string): Promise<Customer | null> {
    try {
      const res = await fetch(`${getApiBase()}api/customers/${id}`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }

  async createCustomer(customer: Omit<Customer, "id" | "businessId" | "createdAt" | "totalBookings">): Promise<Customer> {
    return makeRequest<Customer>("POST", `${this.getBusinessPath()}/customers`, customer);
  }

  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    return makeRequest<Customer>("PATCH", `/api/customers/${id}`, updates);
  }

  async getBookings(date?: string): Promise<Booking[]> {
    try {
      const url = date 
        ? `${getApiBase()}${this.getBusinessPath()}/bookings?date=${date}`
        : `${getApiBase()}${this.getBusinessPath()}/bookings`;
      const res = await fetch(url);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  }

  async getBooking(id: string): Promise<Booking | null> {
    try {
      const res = await fetch(`${getApiBase()}api/bookings/${id}`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }

  async createBooking(booking: Omit<Booking, "id" | "businessId" | "createdAt" | "updatedAt">): Promise<Booking> {
    return makeRequest<Booking>("POST", `${this.getBusinessPath()}/bookings`, booking);
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking> {
    return makeRequest<Booking>("PATCH", `/api/bookings/${id}`, updates);
  }

  async getStats(): Promise<DashboardStats> {
    try {
      const res = await fetch(`${getApiBase()}${this.getBusinessPath()}/stats`);
      if (!res.ok) {
        return {
          totalRevenue: 0,
          totalBookings: 0,
          totalCustomers: 0,
          totalServices: 0,
          todayBookings: 0,
          weeklyData: [],
          recentBookings: [],
        };
      }
      return res.json();
    } catch {
      return {
        totalRevenue: 0,
        totalBookings: 0,
        totalCustomers: 0,
        totalServices: 0,
        todayBookings: 0,
        weeklyData: [],
        recentBookings: [],
      };
    }
  }

  async getTimeSlots(date: string, serviceId?: string): Promise<TimeSlot[]> {
    try {
      const url = serviceId 
        ? `${getApiBase()}${this.getBusinessPath()}/slots/${date}?serviceId=${serviceId}`
        : `${getApiBase()}${this.getBusinessPath()}/slots/${date}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return data.slots || [];
    } catch {
      return [];
    }
  }

  async initializeDemoData(businessType: string = "salon"): Promise<void> {
    await makeRequest<void>("POST", `${this.getBusinessPath()}/demo-data`, { businessType });
  }

  async clearAllData(): Promise<void> {
    return makeRequest<void>("DELETE", `${this.getBusinessPath()}/data`);
  }

  async getQRCode(): Promise<{ qrCode: string; bookingUrl: string } | null> {
    try {
      const res = await fetch(`${getApiBase()}${this.getBusinessPath()}/qrcode`);
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  }

  async getAvailability(): Promise<Availability[]> {
    try {
      const res = await fetch(`${getApiBase()}${this.getBusinessPath()}/availability`);
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  }

  async updateAvailability(dayOfWeek: number, schedule: Partial<AvailabilitySchedule>): Promise<Availability> {
    return makeRequest<Availability>("PUT", `${this.getBusinessPath()}/availability/${dayOfWeek}`, schedule);
  }

  async bulkUpdateAvailability(schedules: AvailabilitySchedule[]): Promise<Availability[]> {
    return makeRequest<Availability[]>("PUT", `${this.getBusinessPath()}/availability`, { schedules });
  }
}

export const api = new ApiClient();
