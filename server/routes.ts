import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import { 
  insertBusinessSchema, 
  insertServiceSchema, 
  insertCustomerSchema, 
  insertBookingSchema 
} from "@shared/schema";
import { z } from "zod";
import path from "path";
import QRCode from "qrcode";
import { sendBookingConfirmation } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  // === BUSINESSES API ===
  
  // Get business by slug (public - for booking flow)
  app.get("/api/businesses/:slug", async (req: Request, res: Response) => {
    try {
      const business = await storage.getBusinessBySlug(req.params.slug);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      res.json(business);
    } catch (error) {
      console.error("Error getting business:", error);
      res.status(500).json({ error: "Failed to get business" });
    }
  });

  // Create business
  app.post("/api/businesses", async (req: Request, res: Response) => {
    try {
      const data = insertBusinessSchema.parse(req.body);
      
      // Check if business with this slug already exists
      const existing = await storage.getBusinessBySlug(data.slug);
      if (existing) {
        return res.status(201).json(existing);
      }
      
      const business = await storage.createBusiness(data);
      res.status(201).json(business);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating business:", error);
      res.status(500).json({ error: "Failed to create business" });
    }
  });

  // Update business
  app.patch("/api/businesses/:id", async (req: Request, res: Response) => {
    try {
      const updates = insertBusinessSchema.partial().parse(req.body);
      const business = await storage.updateBusiness(req.params.id, updates);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      res.json(business);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating business:", error);
      res.status(500).json({ error: "Failed to update business" });
    }
  });

  // === SERVICES API ===
  
  // Get services for a business (public)
  app.get("/api/businesses/:businessId/services", async (req: Request, res: Response) => {
    try {
      const services = await storage.getServices(req.params.businessId);
      res.json(services);
    } catch (error) {
      console.error("Error getting services:", error);
      res.status(500).json({ error: "Failed to get services" });
    }
  });

  // Get single service
  app.get("/api/services/:id", async (req: Request, res: Response) => {
    try {
      const service = await storage.getService(req.params.id);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      console.error("Error getting service:", error);
      res.status(500).json({ error: "Failed to get service" });
    }
  });

  // Create service
  app.post("/api/businesses/:businessId/services", async (req: Request, res: Response) => {
    try {
      const data = insertServiceSchema.parse({
        ...req.body,
        businessId: req.params.businessId,
      });
      const service = await storage.createService(data);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating service:", error);
      res.status(500).json({ error: "Failed to create service" });
    }
  });

  // Update service
  app.patch("/api/services/:id", async (req: Request, res: Response) => {
    try {
      const updates = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(req.params.id, updates);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating service:", error);
      res.status(500).json({ error: "Failed to update service" });
    }
  });

  // Delete service
  app.delete("/api/services/:id", async (req: Request, res: Response) => {
    try {
      await storage.deleteService(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ error: "Failed to delete service" });
    }
  });

  // === CUSTOMERS API ===
  
  // Get customers for a business
  app.get("/api/businesses/:businessId/customers", async (req: Request, res: Response) => {
    try {
      const customers = await storage.getCustomers(req.params.businessId);
      res.json(customers);
    } catch (error) {
      console.error("Error getting customers:", error);
      res.status(500).json({ error: "Failed to get customers" });
    }
  });

  // Get single customer
  app.get("/api/customers/:id", async (req: Request, res: Response) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error getting customer:", error);
      res.status(500).json({ error: "Failed to get customer" });
    }
  });

  // Create customer (public - for booking flow)
  app.post("/api/businesses/:businessId/customers", async (req: Request, res: Response) => {
    try {
      // Check if customer already exists by email
      const existing = await storage.getCustomerByEmail(req.params.businessId, req.body.email);
      if (existing) {
        return res.json(existing);
      }
      
      const data = insertCustomerSchema.parse({
        ...req.body,
        businessId: req.params.businessId,
      });
      const customer = await storage.createCustomer(data);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating customer:", error);
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  // Update customer
  app.patch("/api/customers/:id", async (req: Request, res: Response) => {
    try {
      const updates = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, updates);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating customer:", error);
      res.status(500).json({ error: "Failed to update customer" });
    }
  });

  // === BOOKINGS API ===
  
  // Get bookings for a business
  app.get("/api/businesses/:businessId/bookings", async (req: Request, res: Response) => {
    try {
      const { date } = req.query;
      let bookings;
      if (date && typeof date === "string") {
        bookings = await storage.getBookingsByDate(req.params.businessId, date);
      } else {
        bookings = await storage.getBookings(req.params.businessId);
      }
      res.json(bookings);
    } catch (error) {
      console.error("Error getting bookings:", error);
      res.status(500).json({ error: "Failed to get bookings" });
    }
  });

  // Get single booking
  app.get("/api/bookings/:id", async (req: Request, res: Response) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Error getting booking:", error);
      res.status(500).json({ error: "Failed to get booking" });
    }
  });

  // Create booking (public - for booking flow)
  app.post("/api/businesses/:businessId/bookings", async (req: Request, res: Response) => {
    try {
      const data = insertBookingSchema.parse({
        ...req.body,
        businessId: req.params.businessId,
      });
      const booking = await storage.createBooking(data);
      
      // Send email confirmation
      if (req.body.customerEmail && req.body.customerName) {
        const business = await storage.getBusiness(req.params.businessId);
        const service = await storage.getService(data.serviceId);
        
        sendBookingConfirmation({
          customerName: req.body.customerName,
          customerEmail: req.body.customerEmail,
          serviceName: service?.name || "Service",
          date: data.date,
          time: data.time,
          price: data.totalPrice,
          confirmationNumber: booking.id.slice(0, 8).toUpperCase(),
          businessName: business?.name || "Business"
        }).catch(err => console.error("Failed to send confirmation email:", err));
      }
      
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating booking:", error);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  // Update booking
  app.patch("/api/bookings/:id", async (req: Request, res: Response) => {
    try {
      const updates = insertBookingSchema.partial().parse(req.body);
      const booking = await storage.updateBooking(req.params.id, updates);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error updating booking:", error);
      res.status(500).json({ error: "Failed to update booking" });
    }
  });

  // === AVAILABILITY API ===
  
  // Get availability for a business
  app.get("/api/businesses/:businessId/availability", async (req: Request, res: Response) => {
    try {
      const availability = await storage.getAvailability(req.params.businessId);
      res.json(availability);
    } catch (error) {
      console.error("Error getting availability:", error);
      res.status(500).json({ error: "Failed to get availability" });
    }
  });

  // Get available time slots for a specific date
  app.get("/api/businesses/:businessId/slots/:date", async (req: Request, res: Response) => {
    try {
      const { businessId, date } = req.params;
      const { serviceId } = req.query;
      
      // Get business availability settings
      const availability = await storage.getAvailability(businessId);
      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();
      
      // Find availability for this day
      const dayAvailability = availability.find(a => a.dayOfWeek === dayOfWeek && a.isActive);
      
      if (!dayAvailability) {
        return res.json({ slots: [], message: "Business is closed on this day" });
      }
      
      // Get existing bookings for this date
      const bookings = await storage.getBookingsByDate(businessId, date);
      const bookedTimes = bookings.map(b => b.time);
      
      // Generate time slots
      const slots = [];
      const [startHour] = dayAvailability.startTime.split(":").map(Number);
      const [endHour] = dayAvailability.endTime.split(":").map(Number);
      
      for (let hour = startHour; hour < endHour; hour++) {
        const time = `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? "PM" : "AM"}`;
        const time30 = `${hour > 12 ? hour - 12 : hour}:30 ${hour >= 12 ? "PM" : "AM"}`;
        
        slots.push({
          time,
          available: !bookedTimes.includes(time),
        });
        slots.push({
          time: time30,
          available: !bookedTimes.includes(time30),
        });
      }
      
      res.json({ slots });
    } catch (error) {
      console.error("Error getting slots:", error);
      res.status(500).json({ error: "Failed to get slots" });
    }
  });

  // === DEMO DATA ===
  
  // Initialize demo data for a business
  app.post("/api/businesses/:businessId/demo-data", async (req: Request, res: Response) => {
    try {
      await storage.initializeDemoData(req.params.businessId);
      res.json({ message: "Demo data initialized" });
    } catch (error) {
      console.error("Error initializing demo data:", error);
      res.status(500).json({ error: "Failed to initialize demo data" });
    }
  });

  // === STATS API ===
  
  // Get dashboard stats for a business
  app.get("/api/businesses/:businessId/stats", async (req: Request, res: Response) => {
    try {
      const bookings = await storage.getBookings(req.params.businessId);
      const customers = await storage.getCustomers(req.params.businessId);
      const services = await storage.getServices(req.params.businessId);
      
      const totalRevenue = bookings
        .filter(b => b.status === "completed" || b.status === "confirmed")
        .reduce((sum, b) => sum + b.totalPrice, 0);
      
      const today = new Date().toISOString().split("T")[0];
      const todayBookings = bookings.filter(b => b.date === today);
      
      // Weekly revenue (last 7 days)
      const weeklyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const dayBookings = bookings.filter(b => b.date === dateStr);
        const revenue = dayBookings.reduce((sum, b) => sum + b.totalPrice, 0);
        weeklyData.push({
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
          revenue: revenue / 100,
        });
      }
      
      res.json({
        totalRevenue: totalRevenue / 100,
        totalBookings: bookings.length,
        totalCustomers: customers.length,
        totalServices: services.length,
        todayBookings: todayBookings.length,
        weeklyData,
        recentBookings: bookings.slice(0, 5),
      });
    } catch (error) {
      console.error("Error getting stats:", error);
      res.status(500).json({ error: "Failed to get stats" });
    }
  });

  // === QR CODE API ===
  
  // Generate QR code for booking link
  app.get("/api/businesses/:businessId/qrcode", async (req: Request, res: Response) => {
    try {
      const business = await storage.getBusiness(req.params.businessId);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      
      const host = req.get('host') || 'localhost:5000';
      const protocol = req.protocol;
      const bookingUrl = `${protocol}://${host}/book/${business.slug}`;
      
      const qrCodeDataUrl = await QRCode.toDataURL(bookingUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      res.json({ 
        qrCode: qrCodeDataUrl,
        bookingUrl 
      });
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ error: "Failed to generate QR code" });
    }
  });

  // === PUBLIC BOOKING PAGE ===
  
  // Serve public booking page (client-side routing)
  app.get("/book/:slug", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "templates", "booking.html"));
  });
  
  app.get("/book/:slug/*", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "templates", "booking.html"));
  });

  const httpServer = createServer(app);

  return httpServer;
}
