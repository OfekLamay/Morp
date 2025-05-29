import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { eq, like, gte, lte, and, or, not, desc, asc } from "drizzle-orm";
import { 
  users, insertUserSchema, 
  rules, insertRuleSchema, 
  tickets, insertTicketSchema,
  media, insertMediaSchema
} from "@shared/schema";
import { getAllDescendantUnits } from "./db";
import { db } from "./db";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  
  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const { search, group, page = "1", limit = "10" } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const usersList = await storage.getUsers({ search, group, skip, limit: parseInt(limit) });
      const totalCount = await storage.getUsersCount({ search, group });
      
      res.json({ users: usersList, totalCount });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updatedUser = await storage.updateUser(userId, req.body);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      await storage.deleteUser(userId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.post("/api/users/:id/reset-password", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const newPassword = await storage.resetUserPassword(userId);
      res.json({ success: true, temporaryPassword: newPassword });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Rule routes
  app.get("/api/rules", async (req, res) => {
    try {
      const { search, enforcement, severity, date, page = "1", limit = "10" } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const rulesList = await storage.getRules({ search, enforcement, severity, date, skip, limit: parseInt(limit) });
      const totalCount = await storage.getRulesCount({ search, enforcement, severity, date });
      
      res.json({ rules: rulesList, totalCount });
    } catch (error) {
      console.error("Error fetching rules:", error);
      res.status(500).json({ message: "Failed to fetch rules" });
    }
  });

  app.post("/api/rules", async (req, res) => {
    console.log("Received POST /api/rules with body:", req.body);
    try {
      const ruleData = insertRuleSchema.parse(req.body);
      const newRule = await storage.createRule(ruleData);
      res.status(201).json(newRule);
    } catch (error) {
      console.error("Error creating rule:", error);
      res.status(400).json({ message: "Invalid rule data" });
    }
  });

  app.get("/api/rules/:id", async (req, res) => {
    try {
      const ruleId = parseInt(req.params.id);
      const rule = await storage.getRule(ruleId);
      
      if (!rule) {
        return res.status(404).json({ message: "Rule not found" });
      }
      
      res.json(rule);
    } catch (error) {
      console.error("Error fetching rule:", error);
      res.status(500).json({ message: "Failed to fetch rule" });
    }
  });

  app.patch("/api/rules/:id", async (req, res) => {
    try {
      const ruleId = parseInt(req.params.id);
      const updatedRule = await storage.updateRule(ruleId, req.body);
      
      if (!updatedRule) {
        return res.status(404).json({ message: "Rule not found" });
      }
      
      res.json(updatedRule);
    } catch (error) {
      console.error("Error updating rule:", error);
      res.status(400).json({ message: "Invalid rule data" });
    }
  });

  app.delete("/api/rules/:id", async (req, res) => {
    try {
      const ruleId = parseInt(req.params.id);
      await storage.deleteRule(ruleId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting rule:", error);
      res.status(500).json({ message: "Failed to delete rule" });
    }
  });

  // Rules performance endpoint
  app.get("/api/rules/performance", async (req, res) => {
    try {
      const { ruleIds, period = "7" } = req.query as Record<string, string>;
      const ruleIdList = ruleIds ? ruleIds.split(",").map(id => parseInt(id)) : undefined;
      
      const performance = await storage.getRulesPerformance(ruleIdList, parseInt(period));
      res.json(performance);
    } catch (error) {
      console.error("Error fetching rule performance:", error);
      res.status(500).json({ message: "Failed to fetch rule performance" });
    }
  });

  // Ticket routes - Merkaz
  app.get("/api/merkaz-tickets", async (req, res) => {
    try {
      // Parse pagination params
      const { page = "1", limit = "21" } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Build filters object
      const filters = {
        ...req.query,
        skip,
        limit: parseInt(limit),
      };

      // Get filtered & paginated tickets
      const tickets = await storage.getMerkazTickets(filters, req.user);
      const totalCount = await storage.getMerkazTicketsCount(filters);

      res.json({ tickets, totalCount });
    } catch (error) {
      console.error("Error fetching merkaz tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  app.post("/api/merkaz-tickets", async (req, res) => {
    try {
      const ticketData = insertTicketSchema.parse(req.body);
      const newTicket = await storage.createTicket(ticketData);
      res.status(201).json(newTicket);
    } catch (error) {
      console.error("Error creating ticket:", error);
      res.status(400).json({ message: "Invalid ticket data" });
    }
  });

  app.get("/api/merkaz-tickets/stats", async (req, res) => {
    try {
      const stats = await storage.getMerkazTicketsStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching merkaz ticket stats:", error);
      res.status(500).json({ message: "Failed to fetch ticket stats" });
    }
  });

    app.get("/api/merkaz-tickets/kabams", async (req, res) => {
    try {
      // Get all tickets
      const tickets = await storage.getMerkazTickets({});
      // Extract unique kabams
      const kabams = Array.from(
        new Set(
          tickets
            .map(ticket => ticket.kabamRelated)
            .filter(kabam => kabam)
        )
      );
      res.json({ kabams });
    } catch (error) {
      console.error("Error fetching kabams:", error);
      res.status(500).json({ message: "Failed to fetch kabams" });
    }
  });

  app.get("/api/merkaz-tickets/:id", async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const ticket = await storage.getTicket(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      res.json(ticket);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      res.status(500).json({ message: "Failed to fetch ticket" });
    }
  });

  app.patch("/api/merkaz-tickets/:id", async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const updatedTicket = await storage.updateTicket(ticketId, req.body);
      
      if (!updatedTicket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      res.json(updatedTicket);
    } catch (error) {
      console.error("Error updating ticket:", error);
      res.status(400).json({ message: "Invalid ticket data" });
    }
  });

  app.delete("/api/merkaz-tickets/:id", async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      await storage.deleteTicket(ticketId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting ticket:", error);
      res.status(500).json({ message: "Failed to delete ticket" });
    }
  });

  // Ticket routes - Kabam
  app.get("/api/kabam-tickets", async (req, res) => {
    try {
      const { status, unit, rule, severity, page = "1", limit = "10" } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const ticketsList = await storage.getKabamTickets({ status, unit, rule, severity, skip, limit: parseInt(limit) });
      const totalCount = await storage.getKabamTicketsCount({ status, unit, rule, severity });

      // Explicitly include imageUrl in the response
      const ticketsWithImage = ticketsList.map(ticket => ({
        ...ticket,
        imageUrl: ticket.imageUrl || null,
      }));

      res.json({ tickets: ticketsWithImage, totalCount });
    } catch (error) {
      console.error("Error fetching kabam tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  app.get("/api/kabam-tickets/stats", async (req, res) => {
    try {
      const stats = await storage.getKabamTicketsStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching kabam ticket stats:", error);
      res.status(500).json({ message: "Failed to fetch ticket stats" });
    }
  });

  app.patch("/api/kabam-tickets/:id", async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      // Only allow updating certain fields for safety
      const allowedFields = [
        "usersRelatedTo",
        "status",
        "isTruePositive",
        "unitRelated",
        "severity",
        "expirationDate",
        "imageUrl"
        // add more fields as needed
      ];
      const updateData: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) {
          updateData[key] = req.body[key];
        }
      }

      const updatedTicket = await storage.updateTicket(ticketId, updateData);

      if (!updatedTicket) {
        return res.status(404).json({ message: "Ticket not found" });
      }

      res.json(updatedTicket);
    } catch (error) {
      console.error("Error updating kabam ticket:", error);
      res.status(400).json({ message: "Invalid ticket data" });
    }
  });

  // Media routes
  app.post("/api/media", async (req, res) => {
    try {
      const mediaData = insertMediaSchema.parse(req.body);
      const newMedia = await storage.createMedia(mediaData);
      res.status(201).json(newMedia);
    } catch (error) {
      console.error("Error uploading media:", error);
      res.status(400).json({ message: "Invalid media data" });
    }
  });
  
  app.get("/api/media", async (req, res) => {
    try {
      const mediaList = await storage.getMediaList();
      res.json(mediaList);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  app.get("/api/media/:id", async (req, res) => {
    try {
      const mediaId = parseInt(req.params.id);
      const media = await storage.getMedia(mediaId);
      
      if (!media) {
        return res.status(404).json({ message: "Media not found" });
      }
      
      res.json(media);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  // Tickets route - Combined
  app.get("/api/tickets", async (req, res) => {
    const user = req.user; // however you get the logged-in user
    const allUnits = await db.units.findMany(); // get all units

    let accessibleUnits: string[] = [];

    if (user.permissionGroup === "Kabam") {
      const userUnits = [user.unit, ...(user.unitsUnder?.split(",") || [])];
      accessibleUnits = userUnits.flatMap(unit => [unit, ...getAllDescendantUnits(unit, allUnits)]);
    } else if (user.permissionGroup === "Merkaz Nitur") {
      accessibleUnits = allUnits.map(u => u.unit); // Merkaz sees all
    } else if (user.permissionGroup === "System Administrator") {
      accessibleUnits = []; // or whatever logic you want
    }

    // Now filter tickets
    let tickets;
    if (accessibleUnits.length > 0) {
      tickets = await db.tickets.findMany({
        where: { unitRelated: { $in: accessibleUnits } }
      });
    } else {
      tickets = await db.tickets.findMany();
    }

    res.json({ tickets });
  });

  app.get("/api/my-units", async (req, res) => {
    const user = req.user;
    const allUnits = await db.units.findMany();

    let accessibleUnits: string[] = [];
    if (user.permissionGroup === "Kabam") {
      const userUnits = [user.unit, ...(user.unitsUnder?.split(",") || [])];
      accessibleUnits = userUnits.flatMap(unit => [unit, ...getAllDescendantUnits(unit, allUnits)]);
    }
    res.json({ units: accessibleUnits });
  });

  const httpServer = createServer(app);
  return httpServer;
}
