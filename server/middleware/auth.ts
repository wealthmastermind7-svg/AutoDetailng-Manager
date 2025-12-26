import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";

export interface AuthenticatedRequest extends Request {
  business?: {
    id: string;
    ownerToken: string;
    name: string;
    slug: string;
  };
}

export async function verifyBusinessOwnership(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const businessId = req.params.businessId || req.params.id;
    const ownerToken = req.get("x-business-token");

    if (!businessId) {
      return res.status(400).json({ error: "Business ID is required" });
    }

    if (!ownerToken) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const business = await storage.getBusiness(businessId);
    
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    if (!business.ownerToken) {
      return res.status(403).json({ error: "Business not configured for authenticated access" });
    }

    if (business.ownerToken !== ownerToken) {
      return res.status(403).json({ error: "Invalid authentication token" });
    }

    req.business = {
      id: business.id,
      ownerToken: business.ownerToken,
      name: business.name,
      slug: business.slug,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ error: "Authentication error" });
  }
}

export async function verifyServiceOwnership(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const serviceId = req.params.id;
    const ownerToken = req.get("x-business-token");

    if (!serviceId) {
      return res.status(400).json({ error: "Service ID is required" });
    }

    if (!ownerToken) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const service = await storage.getService(serviceId);
    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    const business = await storage.getBusiness(service.businessId);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    if (!business.ownerToken || business.ownerToken !== ownerToken) {
      return res.status(403).json({ error: "Invalid authentication token" });
    }

    req.business = {
      id: business.id,
      ownerToken: business.ownerToken,
      name: business.name,
      slug: business.slug,
    };

    next();
  } catch (error) {
    console.error("Service auth middleware error:", error);
    return res.status(500).json({ error: "Authentication error" });
  }
}

export async function verifyBookingOwnership(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const bookingId = req.params.id;
    const ownerToken = req.get("x-business-token");

    if (!bookingId) {
      return res.status(400).json({ error: "Booking ID is required" });
    }

    if (!ownerToken) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const booking = await storage.getBooking(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const business = await storage.getBusiness(booking.businessId);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    if (!business.ownerToken || business.ownerToken !== ownerToken) {
      return res.status(403).json({ error: "Invalid authentication token" });
    }

    req.business = {
      id: business.id,
      ownerToken: business.ownerToken,
      name: business.name,
      slug: business.slug,
    };

    next();
  } catch (error) {
    console.error("Booking auth middleware error:", error);
    return res.status(500).json({ error: "Authentication error" });
  }
}

export async function verifyCustomerOwnership(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const customerId = req.params.id;
    const ownerToken = req.get("x-business-token");

    if (!customerId) {
      return res.status(400).json({ error: "Customer ID is required" });
    }

    if (!ownerToken) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const customer = await storage.getCustomer(customerId);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const business = await storage.getBusiness(customer.businessId);
    if (!business) {
      return res.status(404).json({ error: "Business not found" });
    }

    if (!business.ownerToken || business.ownerToken !== ownerToken) {
      return res.status(403).json({ error: "Invalid authentication token" });
    }

    req.business = {
      id: business.id,
      ownerToken: business.ownerToken,
      name: business.name,
      slug: business.slug,
    };

    next();
  } catch (error) {
    console.error("Customer auth middleware error:", error);
    return res.status(500).json({ error: "Authentication error" });
  }
}
