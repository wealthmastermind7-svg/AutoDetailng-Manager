import {
  users,
  businesses,
  services,
  customers,
  bookings,
  availability,
  pushTokens,
  type User,
  type InsertUser,
  type Business,
  type InsertBusiness,
  type Service,
  type InsertService,
  type Customer,
  type InsertCustomer,
  type Booking,
  type InsertBooking,
  type Availability,
  type InsertAvailability,
  type PushToken,
  type InsertPushToken,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Businesses
  getBusiness(id: string): Promise<Business | undefined>;
  getBusinessBySlug(slug: string): Promise<Business | undefined>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: string, updates: Partial<InsertBusiness>): Promise<Business | undefined>;
  
  // Services
  getServices(businessId: string): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, updates: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<void>;
  
  // Customers
  getCustomers(businessId: string): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByEmail(businessId: string, email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer | undefined>;
  
  // Bookings
  getBookings(businessId: string): Promise<(Booking & { customerName: string; serviceName: string })[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByDate(businessId: string, date: string): Promise<(Booking & { customerName: string; serviceName: string })[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking | undefined>;
  
  // Availability
  getAvailability(businessId: string): Promise<Availability[]>;
  setAvailability(availability: InsertAvailability): Promise<Availability>;
  
  // Demo Data
  initializeDemoData(businessId: string): Promise<void>;
  
  // Push Tokens
  getPushTokens(businessId: string): Promise<PushToken[]>;
  getPushTokenByToken(token: string): Promise<PushToken | undefined>;
  createPushToken(pushToken: InsertPushToken): Promise<PushToken>;
  updatePushToken(id: string, updates: Partial<InsertPushToken>): Promise<PushToken | undefined>;
  deletePushToken(token: string, businessId: string): Promise<void>;
  deactivatePushToken(token: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Businesses
  async getBusiness(id: string): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.id, id));
    return business || undefined;
  }

  async getBusinessBySlug(slug: string): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.slug, slug));
    return business || undefined;
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const [created] = await db.insert(businesses).values(business).returning();
    return created;
  }

  async updateBusiness(id: string, updates: Partial<InsertBusiness>): Promise<Business | undefined> {
    const [updated] = await db
      .update(businesses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(businesses.id, id))
      .returning();
    return updated || undefined;
  }

  // Services
  async getServices(businessId: string): Promise<Service[]> {
    return db.select().from(services).where(eq(services.businessId, businessId));
  }

  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async createService(service: InsertService): Promise<Service> {
    const [created] = await db.insert(services).values(service).returning();
    return created;
  }

  async updateService(id: string, updates: Partial<InsertService>): Promise<Service | undefined> {
    const [updated] = await db
      .update(services)
      .set(updates)
      .where(eq(services.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteService(id: string): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  // Customers
  async getCustomers(businessId: string): Promise<Customer[]> {
    return db.select().from(customers).where(eq(customers.businessId, businessId));
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getCustomerByEmail(businessId: string, email: string): Promise<Customer | undefined> {
    const [customer] = await db
      .select()
      .from(customers)
      .where(and(eq(customers.businessId, businessId), eq(customers.email, email)));
    return customer || undefined;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [created] = await db.insert(customers).values(customer).returning();
    return created;
  }

  async updateCustomer(id: string, updates: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [updated] = await db
      .update(customers)
      .set(updates)
      .where(eq(customers.id, id))
      .returning();
    return updated || undefined;
  }

  // Bookings
  async getBookings(businessId: string): Promise<(Booking & { customerName: string; serviceName: string })[]> {
    const result = await db
      .select({
        id: bookings.id,
        businessId: bookings.businessId,
        customerId: bookings.customerId,
        serviceId: bookings.serviceId,
        date: bookings.date,
        time: bookings.time,
        status: bookings.status,
        totalPrice: bookings.totalPrice,
        notes: bookings.notes,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        customerName: customers.name,
        serviceName: services.name,
      })
      .from(bookings)
      .leftJoin(customers, eq(bookings.customerId, customers.id))
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .where(eq(bookings.businessId, businessId))
      .orderBy(desc(bookings.createdAt));
    
    return result.map(r => ({
      ...r,
      customerName: r.customerName || "Unknown",
      serviceName: r.serviceName || "Unknown",
    }));
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async getBookingsByDate(businessId: string, date: string): Promise<(Booking & { customerName: string; serviceName: string })[]> {
    const result = await db
      .select({
        id: bookings.id,
        businessId: bookings.businessId,
        customerId: bookings.customerId,
        serviceId: bookings.serviceId,
        date: bookings.date,
        time: bookings.time,
        status: bookings.status,
        totalPrice: bookings.totalPrice,
        notes: bookings.notes,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        customerName: customers.name,
        serviceName: services.name,
      })
      .from(bookings)
      .leftJoin(customers, eq(bookings.customerId, customers.id))
      .leftJoin(services, eq(bookings.serviceId, services.id))
      .where(and(eq(bookings.businessId, businessId), eq(bookings.date, date)))
      .orderBy(bookings.time);
    
    return result.map(r => ({
      ...r,
      customerName: r.customerName || "Unknown",
      serviceName: r.serviceName || "Unknown",
    }));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [created] = await db.insert(bookings).values(booking).returning();
    
    // Update customer booking count
    await db
      .update(customers)
      .set({ totalBookings: sql`${customers.totalBookings} + 1` })
      .where(eq(customers.id, booking.customerId));
    
    return created;
  }

  async updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [updated] = await db
      .update(bookings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updated || undefined;
  }

  // Availability
  async getAvailability(businessId: string): Promise<Availability[]> {
    return db.select().from(availability).where(eq(availability.businessId, businessId));
  }

  async setAvailability(avail: InsertAvailability): Promise<Availability> {
    const [created] = await db.insert(availability).values(avail).returning();
    return created;
  }

  // Push Tokens
  async getPushTokens(businessId: string): Promise<PushToken[]> {
    return db
      .select()
      .from(pushTokens)
      .where(and(eq(pushTokens.businessId, businessId), eq(pushTokens.isActive, true)));
  }

  async getPushTokenByToken(token: string): Promise<PushToken | undefined> {
    const [pushToken] = await db.select().from(pushTokens).where(eq(pushTokens.token, token));
    return pushToken || undefined;
  }

  async createPushToken(pushToken: InsertPushToken): Promise<PushToken> {
    // Check if token already exists
    const existing = await this.getPushTokenByToken(pushToken.token);
    if (existing) {
      // Update existing token
      const [updated] = await db
        .update(pushTokens)
        .set({ ...pushToken, isActive: true, updatedAt: new Date() })
        .where(eq(pushTokens.id, existing.id))
        .returning();
      return updated;
    }
    
    const [created] = await db.insert(pushTokens).values(pushToken).returning();
    return created;
  }

  async updatePushToken(id: string, updates: Partial<InsertPushToken>): Promise<PushToken | undefined> {
    const [updated] = await db
      .update(pushTokens)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(pushTokens.id, id))
      .returning();
    return updated || undefined;
  }

  async deletePushToken(token: string, businessId: string): Promise<void> {
    await db
      .delete(pushTokens)
      .where(and(eq(pushTokens.token, token), eq(pushTokens.businessId, businessId)));
  }

  async deactivatePushToken(token: string): Promise<void> {
    await db
      .update(pushTokens)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(pushTokens.token, token));
  }

  // Demo Data
  async initializeDemoData(businessId: string, businessType: string = "salon"): Promise<void> {
    // Check if services already exist
    const existingServices = await this.getServices(businessId);
    if (existingServices.length > 0) return;

    const demoDataTemplates: Record<string, { name: string; services: any[]; customers: any[] }> = {
      salon: {
        name: "Signature Salon",
        services: [
          { name: "Haircut", duration: 30, price: 4500, description: "Professional haircut" },
          { name: "Hair Coloring", duration: 120, price: 8500, description: "Full head color treatment" },
          { name: "Beard Trim", duration: 15, price: 2000, description: "Beard grooming and shaping" },
          { name: "Styling", duration: 45, price: 5500, description: "Hair styling for special occasions" },
        ],
        customers: [
          { name: "John Smith", email: "john-customer@example.com", phone: "555-0101" },
          { name: "Sarah Johnson", email: "sarah-customer@example.com", phone: "555-0102" },
          { name: "Michael Brown", email: "michael-customer@example.com", phone: "555-0103" },
          { name: "Emma Davis", email: "emma-customer@example.com", phone: "555-0104" },
        ],
      },
      autodetailing: {
        name: "Premium Auto Detail",
        services: [
          { name: "Basic Wash & Wax", duration: 60, price: 7500, description: "Complete exterior wash and wax" },
          { name: "Interior Detailing", duration: 90, price: 12500, description: "Deep interior cleaning" },
          { name: "Full Detail Package", duration: 180, price: 25000, description: "Complete interior and exterior detail" },
          { name: "Ceramic Coating", duration: 120, price: 35000, description: "Professional ceramic coating application" },
        ],
        customers: [
          { name: "Robert Martinez", email: "robert-car@example.com", phone: "555-0201" },
          { name: "Lisa Anderson", email: "lisa-car@example.com", phone: "555-0202" },
          { name: "David Wilson", email: "david-car@example.com", phone: "555-0203" },
          { name: "Jessica Taylor", email: "jessica-car@example.com", phone: "555-0204" },
        ],
      },
      solar: {
        name: "SunPower Solutions",
        services: [
          { name: "Solar Panel Inspection", duration: 60, price: 15000, description: "Complete system evaluation" },
          { name: "Installation Consultation", duration: 45, price: 0, description: "Free consultation for new installations" },
          { name: "System Maintenance", duration: 120, price: 8500, description: "Annual maintenance and cleaning" },
          { name: "Battery Backup Setup", duration: 180, price: 45000, description: "Battery storage system installation" },
        ],
        customers: [
          { name: "James Thompson", email: "james-solar@example.com", phone: "555-0301" },
          { name: "Patricia Garcia", email: "patricia-solar@example.com", phone: "555-0302" },
          { name: "Christopher Lee", email: "chris-solar@example.com", phone: "555-0303" },
          { name: "Nancy White", email: "nancy-solar@example.com", phone: "555-0304" },
        ],
      },
      coaching: {
        name: "Elite Coaching Academy",
        services: [
          { name: "Personal Training Session", duration: 60, price: 10000, description: "One-on-one coaching session" },
          { name: "Group Coaching Class", duration: 90, price: 6000, description: "Small group coaching session" },
          { name: "Monthly Membership", duration: 2880, price: 35000, description: "Unlimited group classes" },
          { name: "Executive Coaching Package", duration: 300, price: 50000, description: "12-week intensive program" },
        ],
        customers: [
          { name: "Mark Johnson", email: "mark-coach@example.com", phone: "555-0401" },
          { name: "Karen Robinson", email: "karen-coach@example.com", phone: "555-0402" },
          { name: "Steven Clark", email: "steven-coach@example.com", phone: "555-0403" },
          { name: "Dorothy Rodriguez", email: "dorothy-coach@example.com", phone: "555-0404" },
        ],
      },
      fitness: {
        name: "FitZone Gym",
        services: [
          { name: "Personal Training Session", duration: 60, price: 8000, description: "One-on-one fitness training" },
          { name: "Group Fitness Class", duration: 45, price: 2500, description: "Led fitness class" },
          { name: "Monthly Membership", duration: 2880, price: 9999, description: "Unlimited gym access" },
          { name: "Nutrition Consultation", duration: 45, price: 5000, description: "Personalized nutrition planning" },
        ],
        customers: [
          { name: "Andrew Jackson", email: "andrew-fit@example.com", phone: "555-0501" },
          { name: "Susan Miller", email: "susan-fit@example.com", phone: "555-0502" },
          { name: "Thomas Moore", email: "thomas-fit@example.com", phone: "555-0503" },
          { name: "Betty Taylor", email: "betty-fit@example.com", phone: "555-0504" },
        ],
      },
    };

    const template = demoDataTemplates[businessType] || demoDataTemplates.salon;

    try {
      // Create demo services
      const demoServices = template.services.map(s => ({
        businessId,
        name: s.name,
        duration: s.duration,
        price: s.price,
        description: s.description,
      }));

      const createdServices: Service[] = [];
      for (const service of demoServices) {
        const created = await this.createService(service);
        createdServices.push(created);
      }

      // Create demo customers with unique identifiers
      const timestamp = Date.now();
      const demoCustomers = template.customers.map(c => ({
        businessId,
        name: c.name,
        email: `${c.email.split("@")[0]}-${timestamp}@example.com`,
        phone: c.phone,
      }));

      const createdCustomers: Customer[] = [];
      for (const customer of demoCustomers) {
        const created = await this.createCustomer(customer);
        createdCustomers.push(created);
      }

      // Create demo bookings
      const today = new Date();
      const demoBookings = [
        {
          businessId,
          customerId: createdCustomers[0].id,
          serviceId: createdServices[0].id,
          date: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          time: "10:00 AM",
          status: "confirmed",
          totalPrice: createdServices[0].price,
        },
        {
          businessId,
          customerId: createdCustomers[1].id,
          serviceId: createdServices[1].id,
          date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          time: "2:00 PM",
          status: "pending",
          totalPrice: createdServices[1].price,
        },
        {
          businessId,
          customerId: createdCustomers[2].id,
          serviceId: createdServices[0].id,
          date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          time: "11:00 AM",
          status: "confirmed",
          totalPrice: createdServices[0].price,
        },
      ];

      for (const booking of demoBookings) {
        await this.createBooking(booking);
      }

      // Create default availability (Monday-Friday, 9am-5pm)
      for (let day = 1; day <= 5; day++) {
        await this.setAvailability({
          businessId,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "17:00",
          isActive: true,
        });
      }
    } catch (error) {
      console.error("Error in initializeDemoData:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
