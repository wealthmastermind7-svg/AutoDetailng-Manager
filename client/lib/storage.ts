import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ServiceLink {
  id: string;
  title: string;
  url: string;
  category: "gallery" | "video" | "external" | "social";
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
  links?: ServiceLink[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalBookings: number;
}

export interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  status: BookingStatus;
  totalPrice: number;
  createdAt: string;
}

const STORAGE_KEYS = {
  SERVICES: "@autodetailingmanager_services",
  BOOKINGS: "@autodetailingmanager_bookings",
  CUSTOMERS: "@autodetailingmanager_customers",
  AVAILABILITY: "@autodetailingmanager_availability",
};

export const StorageService = {
  async getServices(): Promise<Service[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SERVICES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting services:", error);
      return [];
    }
  },

  async addService(service: Service): Promise<void> {
    try {
      const services = await this.getServices();
      services.push(service);
      await AsyncStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    } catch (error) {
      console.error("Error adding service:", error);
    }
  },

  async updateService(serviceId: string, updates: Partial<Service>): Promise<void> {
    try {
      const services = await this.getServices();
      const index = services.findIndex((s) => s.id === serviceId);
      if (index >= 0) {
        services[index] = { ...services[index], ...updates };
        await AsyncStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
      }
    } catch (error) {
      console.error("Error updating service:", error);
    }
  },

  async deleteService(serviceId: string): Promise<void> {
    try {
      const services = await this.getServices();
      const filtered = services.filter((s) => s.id !== serviceId);
      await AsyncStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  },

  async getBookings(): Promise<Booking[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.BOOKINGS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting bookings:", error);
      return [];
    }
  },

  async getBookingById(bookingId: string): Promise<Booking | null> {
    try {
      const bookings = await this.getBookings();
      return bookings.find((b) => b.id === bookingId) || null;
    } catch (error) {
      console.error("Error getting booking:", error);
      return null;
    }
  },

  async addBooking(booking: Booking): Promise<void> {
    try {
      const bookings = await this.getBookings();
      bookings.push(booking);
      await AsyncStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
      
      // Update customer
      const customers = await this.getCustomers();
      const customerIndex = customers.findIndex((c) => c.id === booking.customerId);
      if (customerIndex >= 0) {
        customers[customerIndex].totalBookings += 1;
      }
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    } catch (error) {
      console.error("Error adding booking:", error);
    }
  },

  async updateBooking(bookingId: string, updates: Partial<Booking>): Promise<void> {
    try {
      const bookings = await this.getBookings();
      const index = bookings.findIndex((b) => b.id === bookingId);
      if (index >= 0) {
        bookings[index] = { ...bookings[index], ...updates };
        await AsyncStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
      }
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  },

  async getCustomers(): Promise<Customer[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting customers:", error);
      return [];
    }
  },

  async getCustomerById(customerId: string): Promise<Customer | null> {
    try {
      const customers = await this.getCustomers();
      return customers.find((c) => c.id === customerId) || null;
    } catch (error) {
      console.error("Error getting customer:", error);
      return null;
    }
  },

  async addCustomer(customer: Customer): Promise<void> {
    try {
      const customers = await this.getCustomers();
      customers.push(customer);
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    } catch (error) {
      console.error("Error adding customer:", error);
    }
  },

  async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<void> {
    try {
      const customers = await this.getCustomers();
      const index = customers.findIndex((c) => c.id === customerId);
      if (index >= 0) {
        customers[index] = { ...customers[index], ...updates };
        await AsyncStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
      }
    } catch (error) {
      console.error("Error updating customer:", error);
    }
  },

  async initializeDemoData(): Promise<void> {
    try {
      const existingServices = await this.getServices();
      if (existingServices.length === 0) {
        const demoServices: Service[] = [
          { id: "1", name: "Essential Wash", duration: 30, price: 42, description: "Hand wash, tire shine, and quick exterior dry" },
          { id: "2", name: "Standard Detail", duration: 60, price: 78, description: "Exterior wash, interior vacuum, and window cleaning" },
          { id: "3", name: "Premium Detail", duration: 90, price: 125, description: "Full exterior detail with wax, interior deep clean, and protectant" },
          { id: "4", name: "Interior Restoration", duration: 120, price: 155, description: "Deep interior cleaning, odor treatment, and conditioning" },
          { id: "5", name: "Ceramic Coating", duration: 180, price: 299, description: "Professional ceramic coating application for paint protection" },
          { id: "6", name: "Paint Protection Film", duration: 240, price: 450, description: "Clear protective film for high-wear areas" },
          { id: "7", name: "Wheel & Tire Detail", duration: 45, price: 65, description: "Deep wheel cleaning, tire dressing, and brake dust removal" },
          { id: "8", name: "Exterior Polish", duration: 120, price: 185, description: "Machine polish, scratch removal, and protective topcoat" },
          { id: "9", name: "Engine Bay Cleaning", duration: 60, price: 95, description: "Safe engine compartment cleaning and detailing" },
          { id: "10", name: "Headlight Restoration", duration: 45, price: 72, description: "Restore clarity and brightness to oxidized headlights" },
          { id: "11", name: "Glass Coating", duration: 60, price: 88, description: "Water-repellent coating for windows and glass surfaces" },
          { id: "12", name: "Leather Conditioning", duration: 90, price: 140, description: "Restore and protect leather seats and interior panels" },
        ];
        for (const service of demoServices) {
          await this.addService(service);
        }
      }

      const existingCustomers = await this.getCustomers();
      if (existingCustomers.length === 0) {
        const demoCustomers: Customer[] = [
          { id: "1", name: "Alex Rodriguez", email: "alex@example.com", phone: "555-0101", totalBookings: 8 },
          { id: "2", name: "Jessica Chen", email: "jessica@example.com", phone: "555-0102", totalBookings: 5 },
          { id: "3", name: "Marcus Thompson", email: "marcus@example.com", phone: "555-0103", totalBookings: 12 },
          { id: "4", name: "Lisa Anderson", email: "lisa@example.com", phone: "555-0104", totalBookings: 3 },
          { id: "5", name: "David Martinez", email: "david@example.com", phone: "555-0105", totalBookings: 6 },
        ];
        for (const customer of demoCustomers) {
          await this.addCustomer(customer);
        }
      }

      const existingBookings = await this.getBookings();
      if (existingBookings.length === 0) {
        const demoBookings: Booking[] = [
          {
            id: "1",
            customerId: "1",
            customerName: "Alex Rodriguez",
            serviceId: "2",
            serviceName: "Standard Detail",
            date: "2025-01-15",
            time: "10:00 AM",
            status: "confirmed",
            totalPrice: 78,
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            customerId: "2",
            customerName: "Jessica Chen",
            serviceId: "3",
            serviceName: "Premium Detail",
            date: "2025-01-16",
            time: "2:00 PM",
            status: "pending",
            totalPrice: 125,
            createdAt: new Date().toISOString(),
          },
          {
            id: "3",
            customerId: "3",
            customerName: "Marcus Thompson",
            serviceId: "1",
            serviceName: "Essential Wash",
            date: "2025-01-17",
            time: "11:00 AM",
            status: "confirmed",
            totalPrice: 42,
            createdAt: new Date().toISOString(),
          },
          {
            id: "4",
            customerId: "4",
            customerName: "Lisa Anderson",
            serviceId: "7",
            serviceName: "Wheel & Tire Detail",
            date: "2025-01-18",
            time: "3:30 PM",
            status: "confirmed",
            totalPrice: 65,
            createdAt: new Date().toISOString(),
          },
          {
            id: "5",
            customerId: "5",
            customerName: "David Martinez",
            serviceId: "5",
            serviceName: "Ceramic Coating",
            date: "2025-01-19",
            time: "9:00 AM",
            status: "pending",
            totalPrice: 299,
            createdAt: new Date().toISOString(),
          },
        ];
        for (const booking of demoBookings) {
          await this.addBooking(booking);
        }
      }
    } catch (error) {
      console.error("Error initializing demo data:", error);
    }
  },

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.SERVICES,
        STORAGE_KEYS.BOOKINGS,
        STORAGE_KEYS.CUSTOMERS,
        STORAGE_KEYS.AVAILABILITY,
      ]);
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  },
};
