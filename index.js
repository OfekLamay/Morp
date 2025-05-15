// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomBytes } from "crypto";
var MemStorage = class {
  usersData;
  rulesData;
  ticketsData;
  mediaData;
  userCurrentId;
  ruleCurrentId;
  ticketCurrentId;
  mediaCurrentId;
  constructor() {
    this.usersData = /* @__PURE__ */ new Map();
    this.rulesData = /* @__PURE__ */ new Map();
    this.ticketsData = /* @__PURE__ */ new Map();
    this.mediaData = /* @__PURE__ */ new Map();
    this.userCurrentId = 1;
    this.ruleCurrentId = 1;
    this.ticketCurrentId = 1;
    this.mediaCurrentId = 1;
    this.seedData();
  }
  seedData() {
    const sampleUsers = [
      {
        fullName: "John Smith",
        username: "jsmith",
        email: "jsmith@example.com",
        password: "password123",
        permissionGroup: "System Administrator",
        isManager: true,
        kabam: "",
        ticketsManaging: 0,
        unitsUnder: ""
      },
      {
        fullName: "Sarah Johnson",
        username: "sjohnson",
        email: "sjohnson@example.com",
        password: "password123",
        permissionGroup: "Merkaz Nitur",
        isManager: true,
        kabam: "",
        ticketsManaging: 3,
        unitsUnder: ""
      },
      {
        fullName: "David Lee",
        username: "dlee",
        email: "dlee@example.com",
        password: "password123",
        permissionGroup: "Kabam",
        isManager: false,
        kabam: "Kabam A",
        ticketsManaging: 2,
        unitsUnder: "Unit 1,Unit 2"
      }
    ];
    sampleUsers.forEach((user) => this.createUser(user));
    const sampleRules = [
      {
        creationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1e3),
        itemsList: ["shoes", "jeans", "t-shirt"],
        description: "Detect suspicious location patterns",
        enforcement: "ACTIVE",
        userCreated: "jsmith",
        managerApproved: "sjohnson",
        importance: 8,
        usersRelatedTo: ["dlee", "sjohnson"],
        enabled: true
      },
      {
        creationDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1e3),
        itemsList: ["phone", "laptop", "wifi"],
        description: "Monitor high-risk communications",
        enforcement: "ACTIVE",
        userCreated: "sjohnson",
        managerApproved: "jsmith",
        importance: 9,
        usersRelatedTo: ["dlee"],
        enabled: true
      },
      {
        creationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1e3),
        itemsList: ["file", "usb", "document"],
        description: "Identify unusual file transfers",
        enforcement: "SILENT",
        userCreated: "dlee",
        managerApproved: "",
        importance: 5,
        usersRelatedTo: [],
        enabled: true
      }
    ];
    sampleRules.forEach((rule) => this.createRule(rule));
    const sampleTickets = [
      {
        expirationDate: new Date(Date.now() + 8 * 60 * 60 * 1e3),
        userGatheredFrom: "user123",
        relatedRulesList: [1],
        importance: 8,
        status: "in progress",
        kabamRelated: "Kabam A",
        unitRelated: "Unit 1"
      },
      {
        expirationDate: new Date(Date.now() + 6 * 60 * 60 * 1e3),
        userGatheredFrom: "user456",
        relatedRulesList: [2],
        importance: 6,
        status: "done",
        kabamRelated: "Kabam B",
        unitRelated: "Unit 3"
      },
      {
        expirationDate: new Date(Date.now() - 4 * 60 * 60 * 1e3),
        userGatheredFrom: "user789",
        relatedRulesList: [1],
        importance: 3,
        status: "false positive",
        kabamRelated: "Kabam C",
        unitRelated: "Unit 2"
      }
    ];
    sampleTickets.forEach((ticket) => this.createTicket(ticket));
  }
  // User methods
  async getUser(id) {
    return this.usersData.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.usersData.values()).find(
      (user) => user.username === username
    );
  }
  async getUsers(filters = {}) {
    let users3 = Array.from(this.usersData.values());
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      users3 = users3.filter(
        (user) => user.fullName.toLowerCase().includes(searchLower) || user.username.toLowerCase().includes(searchLower) || user.email.toLowerCase().includes(searchLower)
      );
    }
    if (filters.group) {
      users3 = users3.filter((user) => user.permissionGroup === filters.group);
    }
    users3.sort((a, b) => b.id - a.id);
    if (filters.skip !== void 0 && filters.limit !== void 0) {
      users3 = users3.slice(filters.skip, filters.skip + filters.limit);
    }
    return users3;
  }
  async getUsersCount(filters = {}) {
    let users3 = Array.from(this.usersData.values());
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      users3 = users3.filter(
        (user) => user.fullName.toLowerCase().includes(searchLower) || user.username.toLowerCase().includes(searchLower) || user.email.toLowerCase().includes(searchLower)
      );
    }
    if (filters.group) {
      users3 = users3.filter((user) => user.permissionGroup === filters.group);
    }
    return users3.length;
  }
  async createUser(insertUser) {
    const id = this.userCurrentId++;
    const now = /* @__PURE__ */ new Date();
    const user = {
      ...insertUser,
      id,
      lastLogin: null,
      createdAt: now
    };
    this.usersData.set(id, user);
    return user;
  }
  async updateUser(id, userData) {
    const user = this.usersData.get(id);
    if (!user) return void 0;
    const updatedUser = { ...user, ...userData };
    this.usersData.set(id, updatedUser);
    return updatedUser;
  }
  async deleteUser(id) {
    this.usersData.delete(id);
  }
  async resetUserPassword(id) {
    const user = this.usersData.get(id);
    if (!user) throw new Error("User not found");
    const tempPassword = randomBytes(4).toString("hex");
    user.password = tempPassword;
    this.usersData.set(id, user);
    return tempPassword;
  }
  // Rule methods
  async getRule(id) {
    return this.rulesData.get(id);
  }
  async getRules(filters = {}) {
    let rules3 = Array.from(this.rulesData.values());
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      rules3 = rules3.filter(
        (rule) => rule.description.toLowerCase().includes(searchLower)
      );
    }
    if (filters.enforcement) {
      if (filters.enforcement === "disabled") {
        rules3 = rules3.filter((rule) => !rule.enabled);
      } else {
        rules3 = rules3.filter(
          (rule) => rule.enabled && rule.enforcement === filters.enforcement
        );
      }
    }
    if (filters.severity) {
      switch (filters.severity) {
        case "high":
          rules3 = rules3.filter((rule) => rule.importance >= 8);
          break;
        case "medium":
          rules3 = rules3.filter((rule) => rule.importance >= 5 && rule.importance <= 7);
          break;
        case "low":
          rules3 = rules3.filter((rule) => rule.importance <= 4);
          break;
      }
    }
    if (filters.date) {
      const filterDate = new Date(filters.date);
      rules3 = rules3.filter((rule) => {
        const ruleDate = new Date(rule.creationDate);
        return ruleDate.toDateString() === filterDate.toDateString();
      });
    }
    rules3.sort((a, b) => b.id - a.id);
    if (filters.skip !== void 0 && filters.limit !== void 0) {
      rules3 = rules3.slice(filters.skip, filters.skip + filters.limit);
    }
    return rules3;
  }
  async getRulesCount(filters = {}) {
    let rules3 = Array.from(this.rulesData.values());
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      rules3 = rules3.filter(
        (rule) => rule.description.toLowerCase().includes(searchLower)
      );
    }
    if (filters.enforcement) {
      if (filters.enforcement === "disabled") {
        rules3 = rules3.filter((rule) => !rule.enabled);
      } else {
        rules3 = rules3.filter(
          (rule) => rule.enabled && rule.enforcement === filters.enforcement
        );
      }
    }
    if (filters.severity) {
      switch (filters.severity) {
        case "high":
          rules3 = rules3.filter((rule) => rule.importance >= 8);
          break;
        case "medium":
          rules3 = rules3.filter((rule) => rule.importance >= 5 && rule.importance <= 7);
          break;
        case "low":
          rules3 = rules3.filter((rule) => rule.importance <= 4);
          break;
      }
    }
    if (filters.date) {
      const filterDate = new Date(filters.date);
      rules3 = rules3.filter((rule) => {
        const ruleDate = new Date(rule.creationDate);
        return ruleDate.toDateString() === filterDate.toDateString();
      });
    }
    return rules3.length;
  }
  async createRule(insertRule) {
    const id = this.ruleCurrentId++;
    const rule = {
      ...insertRule,
      id,
      creationDate: insertRule.creationDate || /* @__PURE__ */ new Date()
    };
    this.rulesData.set(id, rule);
    return rule;
  }
  async updateRule(id, ruleData) {
    const rule = this.rulesData.get(id);
    if (!rule) return void 0;
    const updatedRule = { ...rule, ...ruleData };
    this.rulesData.set(id, updatedRule);
    return updatedRule;
  }
  async deleteRule(id) {
    this.rulesData.delete(id);
  }
  async getRulesPerformance(ruleIds, period = 7) {
    let rules3 = Array.from(this.rulesData.values());
    if (ruleIds && ruleIds.length > 0) {
      rules3 = rules3.filter((rule) => ruleIds.includes(rule.id));
    }
    const periodStart = new Date(Date.now() - period * 24 * 60 * 60 * 1e3);
    const tickets3 = Array.from(this.ticketsData.values()).filter((ticket) => {
      const ticketDate = new Date(ticket.creationDate);
      return ticketDate >= periodStart;
    });
    const topRules = rules3.map((rule) => {
      const ruleTickets = tickets3.filter(
        (ticket) => ticket.relatedRulesList.includes(rule.id)
      );
      const truePositives = ruleTickets.filter((ticket) => ticket.isTruePositive).length;
      const falsePositives = ruleTickets.filter((ticket) => !ticket.isTruePositive).length;
      const totalTickets = ruleTickets.length;
      const truePositiveRate = totalTickets > 0 ? truePositives / totalTickets * 100 : 0;
      const falsePositiveRate = totalTickets > 0 ? falsePositives / totalTickets * 100 : 0;
      const avgResolutionTime = 2 + Math.random() * 4;
      return {
        id: rule.id,
        description: rule.description,
        ticketCount: totalTickets,
        truePositiveRate: parseFloat(truePositiveRate.toFixed(1)),
        falsePositiveRate: parseFloat(falsePositiveRate.toFixed(1)),
        avgResolutionTime: parseFloat(avgResolutionTime.toFixed(1))
      };
    });
    topRules.sort((a, b) => b.ticketCount - a.ticketCount);
    const performanceOverTime = [];
    for (let i = 0; i < period; i++) {
      const date = new Date(Date.now() - (period - i - 1) * 24 * 60 * 60 * 1e3);
      const dateString = date.toISOString().split("T")[0];
      const ruleData = rules3.map((rule) => {
        const truePositives = Math.floor(Math.random() * 15) + 5;
        const falsePositives = Math.floor(Math.random() * 5) + 1;
        return {
          ruleId: rule.id,
          truePositives,
          falsePositives
        };
      });
      performanceOverTime.push({
        date: dateString,
        ruleData
      });
    }
    const monthlyComparison = rules3.map((rule) => {
      const prevTickets = Math.floor(Math.random() * 100) + 20;
      const currTickets = Math.floor(Math.random() * 100) + 20;
      const prevTruePositiveRate = Math.floor(Math.random() * 20) + 60;
      const currTruePositiveRate = Math.floor(Math.random() * 20) + 60;
      let trend;
      if (currTruePositiveRate > prevTruePositiveRate) {
        trend = "improving";
      } else if (currTruePositiveRate < prevTruePositiveRate) {
        trend = "declining";
      } else {
        trend = "stable";
      }
      return {
        ruleId: rule.id,
        prevTickets,
        currTickets,
        prevTruePositiveRate,
        currTruePositiveRate,
        trend
      };
    });
    return {
      topRules,
      performanceOverTime,
      monthlyComparison
    };
  }
  // Ticket methods
  async getTicket(id) {
    return this.ticketsData.get(id);
  }
  async getMerkazTickets(filters = {}) {
    let tickets3 = Array.from(this.ticketsData.values());
    if (filters.status) {
      tickets3 = tickets3.filter((ticket) => ticket.status === filters.status);
    }
    if (filters.kabam) {
      tickets3 = tickets3.filter((ticket) => ticket.kabamRelated === filters.kabam);
    }
    if (filters.rule) {
      const ruleId = parseInt(filters.rule);
      tickets3 = tickets3.filter((ticket) => ticket.relatedRulesList.includes(ruleId));
    }
    if (filters.severity) {
      switch (filters.severity) {
        case "high":
          tickets3 = tickets3.filter((ticket) => ticket.importance >= 8);
          break;
        case "medium":
          tickets3 = tickets3.filter((ticket) => ticket.importance >= 5 && ticket.importance <= 7);
          break;
        case "low":
          tickets3 = tickets3.filter((ticket) => ticket.importance <= 4);
          break;
      }
    }
    tickets3.sort((a, b) => b.id - a.id);
    if (filters.skip !== void 0 && filters.limit !== void 0) {
      tickets3 = tickets3.slice(filters.skip, filters.skip + filters.limit);
    }
    return tickets3;
  }
  async getMerkazTicketsCount(filters = {}) {
    let tickets3 = Array.from(this.ticketsData.values());
    if (filters.status) {
      tickets3 = tickets3.filter((ticket) => ticket.status === filters.status);
    }
    if (filters.kabam) {
      tickets3 = tickets3.filter((ticket) => ticket.kabamRelated === filters.kabam);
    }
    if (filters.rule) {
      const ruleId = parseInt(filters.rule);
      tickets3 = tickets3.filter((ticket) => ticket.relatedRulesList.includes(ruleId));
    }
    if (filters.severity) {
      switch (filters.severity) {
        case "high":
          tickets3 = tickets3.filter((ticket) => ticket.importance >= 8);
          break;
        case "medium":
          tickets3 = tickets3.filter((ticket) => ticket.importance >= 5 && ticket.importance <= 7);
          break;
        case "low":
          tickets3 = tickets3.filter((ticket) => ticket.importance <= 4);
          break;
      }
    }
    return tickets3.length;
  }
  async getKabamTickets(filters = {}) {
    let tickets3 = Array.from(this.ticketsData.values());
    if (filters.status) {
      tickets3 = tickets3.filter((ticket) => ticket.status === filters.status);
    }
    if (filters.unit) {
      tickets3 = tickets3.filter((ticket) => ticket.unitRelated === filters.unit);
    }
    if (filters.rule) {
      const ruleId = parseInt(filters.rule);
      tickets3 = tickets3.filter((ticket) => ticket.relatedRulesList.includes(ruleId));
    }
    if (filters.severity) {
      switch (filters.severity) {
        case "high":
          tickets3 = tickets3.filter((ticket) => ticket.importance >= 8);
          break;
        case "medium":
          tickets3 = tickets3.filter((ticket) => ticket.importance >= 5 && ticket.importance <= 7);
          break;
        case "low":
          tickets3 = tickets3.filter((ticket) => ticket.importance <= 4);
          break;
      }
    }
    tickets3.sort((a, b) => b.id - a.id);
    if (filters.skip !== void 0 && filters.limit !== void 0) {
      tickets3 = tickets3.slice(filters.skip, filters.skip + filters.limit);
    }
    return tickets3;
  }
  async getKabamTicketsCount(filters = {}) {
    let tickets3 = Array.from(this.ticketsData.values());
    if (filters.status) {
      tickets3 = tickets3.filter((ticket) => ticket.status === filters.status);
    }
    if (filters.unit) {
      tickets3 = tickets3.filter((ticket) => ticket.unitRelated === filters.unit);
    }
    if (filters.rule) {
      const ruleId = parseInt(filters.rule);
      tickets3 = tickets3.filter((ticket) => ticket.relatedRulesList.includes(ruleId));
    }
    if (filters.severity) {
      switch (filters.severity) {
        case "high":
          tickets3 = tickets3.filter((ticket) => ticket.importance >= 8);
          break;
        case "medium":
          tickets3 = tickets3.filter((ticket) => ticket.importance >= 5 && ticket.importance <= 7);
          break;
        case "low":
          tickets3 = tickets3.filter((ticket) => ticket.importance <= 4);
          break;
      }
    }
    return tickets3.length;
  }
  async createTicket(insertTicket) {
    const id = this.ticketCurrentId++;
    const now = /* @__PURE__ */ new Date();
    const ticket = {
      ...insertTicket,
      id,
      creationDate: now,
      status: insertTicket.status || "waiting for identification",
      isTruePositive: insertTicket.isTruePositive || false,
      userManaging: insertTicket.userManaging || "",
      usersRelatedTo: insertTicket.usersRelatedTo || [],
      kabamRelated: insertTicket.kabamRelated || "need to be related",
      unitRelated: insertTicket.unitRelated || "need to be related"
    };
    this.ticketsData.set(id, ticket);
    return ticket;
  }
  async updateTicket(id, ticketData) {
    const ticket = this.ticketsData.get(id);
    if (!ticket) return void 0;
    const updatedTicket = { ...ticket, ...ticketData };
    this.ticketsData.set(id, updatedTicket);
    return updatedTicket;
  }
  async deleteTicket(id) {
    this.ticketsData.delete(id);
  }
  async getMerkazTicketsStats() {
    const tickets3 = Array.from(this.ticketsData.values());
    const totalCount = tickets3.length;
    const highSeverityCount = tickets3.filter((ticket) => ticket.importance >= 6).length;
    const inProgressCount = tickets3.filter((ticket) => ticket.status === "in progress").length;
    const kabamSet = /* @__PURE__ */ new Set();
    tickets3.forEach((ticket) => {
      if (ticket.kabamRelated && ticket.kabamRelated !== "need to be related") {
        kabamSet.add(ticket.kabamRelated);
      }
    });
    const kabamUserCount = kabamSet.size;
    const statusDistribution = {};
    tickets3.forEach((ticket) => {
      statusDistribution[ticket.status] = (statusDistribution[ticket.status] || 0) + 1;
    });
    return {
      totalCount,
      highSeverityCount,
      inProgressCount,
      kabamUserCount,
      statusDistribution
    };
  }
  async getKabamTicketsStats() {
    const tickets3 = Array.from(this.ticketsData.values());
    const totalCount = tickets3.length;
    const highSeverityCount = tickets3.filter((ticket) => ticket.importance >= 6).length;
    const inProgressCount = tickets3.filter((ticket) => ticket.status === "in progress").length;
    const unitSet = /* @__PURE__ */ new Set();
    tickets3.forEach((ticket) => {
      if (ticket.unitRelated && ticket.unitRelated !== "need to be related") {
        unitSet.add(ticket.unitRelated);
      }
    });
    const unitCount = unitSet.size;
    const statusDistribution = {};
    tickets3.forEach((ticket) => {
      statusDistribution[ticket.status] = (statusDistribution[ticket.status] || 0) + 1;
    });
    return {
      totalCount,
      highSeverityCount,
      inProgressCount,
      unitCount,
      statusDistribution
    };
  }
  // Media methods
  async getMedia(id) {
    return this.mediaData.get(id);
  }
  async getMediaList() {
    return Array.from(this.mediaData.values());
  }
  async createMedia(insertMedia) {
    const id = this.mediaCurrentId++;
    const media3 = {
      ...insertMedia,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.mediaData.set(id, media3);
    return media3;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  permissionGroup: text("permission_group").notNull(),
  // "Merkaz", "Kabam", "System Administrator"
  isManager: boolean("is_manager").default(false),
  kabam: text("kabam").default(""),
  lastLogin: timestamp("last_login"),
  ticketsManaging: integer("tickets_managing").default(0),
  unitsUnder: text("units_under").default(""),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  lastLogin: true,
  createdAt: true
});
var media = pgTable("media", {
  id: serial("id").primaryKey(),
  releaseDate: timestamp("release_date").notNull(),
  acquiringDate: timestamp("acquiring_date").notNull(),
  userGatheredFrom: text("user_gathered_from").notNull(),
  userGatheredFromId: text("user_gathered_from_id").notNull(),
  objectList: json("object_list").$type().notNull(),
  mediaFile: text("media_file").notNull(),
  // Path or URL to the media file
  createdAt: timestamp("created_at").defaultNow()
});
var insertMediaSchema = createInsertSchema(media).omit({
  id: true,
  createdAt: true
});
var rules = pgTable("rules", {
  id: serial("id").primaryKey(),
  creationDate: timestamp("creation_date").defaultNow(),
  itemsList: json("items_list").$type().notNull(),
  description: text("description").notNull(),
  enforcement: text("enforcement").notNull(),
  // "ACTIVE", "SILENT"
  userCreated: text("user_created").notNull(),
  managerApproved: text("manager_approved").default(""),
  importance: integer("importance").notNull(),
  // 1-10
  usersRelatedTo: json("users_related_to").$type().default([]),
  enabled: boolean("enabled").default(true)
  // ENABLED/DISABLED
});
var insertRuleSchema = createInsertSchema(rules).omit({
  id: true,
  creationDate: true
});
var tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  creationDate: timestamp("creation_date").defaultNow(),
  expirationDate: timestamp("expiration_date").notNull(),
  userGatheredFrom: text("user_gathered_from").notNull(),
  userManaging: text("user_managing").default(""),
  relatedRulesList: json("related_rules_list").$type().notNull(),
  importance: integer("importance").notNull(),
  usersRelatedTo: json("users_related_to").$type().default([]),
  status: text("status").notNull().default("waiting for identification"),
  // done, in progress, FP, waiting for identification, not related yet, reopened
  isTruePositive: boolean("is_true_positive").default(false),
  // FP/TP
  kabamRelated: text("kabam_related").default("need to be related"),
  unitRelated: text("unit_related").default("need to be related")
});
var insertTicketSchema = createInsertSchema(tickets).omit({
  id: true,
  creationDate: true
});

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/users", async (req, res) => {
    try {
      const { search, group, page = "1", limit = "10" } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const usersList = await storage.getUsers({ search, group, skip, limit: parseInt(limit) });
      const totalCount = await storage.getUsersCount({ search, group });
      res.json({ users: usersList, totalCount });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
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
  app2.patch("/api/users/:id", async (req, res) => {
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
  app2.delete("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      await storage.deleteUser(userId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  app2.post("/api/users/:id/reset-password", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const newPassword = await storage.resetUserPassword(userId);
      res.json({ success: true, temporaryPassword: newPassword });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });
  app2.get("/api/rules", async (req, res) => {
    try {
      const { search, enforcement, severity, date, page = "1", limit = "10" } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const rulesList = await storage.getRules({ search, enforcement, severity, date, skip, limit: parseInt(limit) });
      const totalCount = await storage.getRulesCount({ search, enforcement, severity, date });
      res.json({ rules: rulesList, totalCount });
    } catch (error) {
      console.error("Error fetching rules:", error);
      res.status(500).json({ message: "Failed to fetch rules" });
    }
  });
  app2.post("/api/rules", async (req, res) => {
    try {
      const ruleData = insertRuleSchema.parse(req.body);
      const newRule = await storage.createRule(ruleData);
      res.status(201).json(newRule);
    } catch (error) {
      console.error("Error creating rule:", error);
      res.status(400).json({ message: "Invalid rule data" });
    }
  });
  app2.get("/api/rules/:id", async (req, res) => {
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
  app2.patch("/api/rules/:id", async (req, res) => {
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
  app2.delete("/api/rules/:id", async (req, res) => {
    try {
      const ruleId = parseInt(req.params.id);
      await storage.deleteRule(ruleId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting rule:", error);
      res.status(500).json({ message: "Failed to delete rule" });
    }
  });
  app2.get("/api/rules/performance", async (req, res) => {
    try {
      const { ruleIds, period = "7" } = req.query;
      const ruleIdList = ruleIds ? ruleIds.split(",").map((id) => parseInt(id)) : void 0;
      const performance = await storage.getRulesPerformance(ruleIdList, parseInt(period));
      res.json(performance);
    } catch (error) {
      console.error("Error fetching rule performance:", error);
      res.status(500).json({ message: "Failed to fetch rule performance" });
    }
  });
  app2.get("/api/merkaz-tickets", async (req, res) => {
    try {
      const { status, kabam, rule, severity, page = "1", limit = "10" } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const ticketsList = await storage.getMerkazTickets({ status, kabam, rule, severity, skip, limit: parseInt(limit) });
      const totalCount = await storage.getMerkazTicketsCount({ status, kabam, rule, severity });
      res.json({ tickets: ticketsList, totalCount });
    } catch (error) {
      console.error("Error fetching merkaz tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });
  app2.post("/api/merkaz-tickets", async (req, res) => {
    try {
      const ticketData = insertTicketSchema.parse(req.body);
      const newTicket = await storage.createTicket(ticketData);
      res.status(201).json(newTicket);
    } catch (error) {
      console.error("Error creating ticket:", error);
      res.status(400).json({ message: "Invalid ticket data" });
    }
  });
  app2.get("/api/merkaz-tickets/stats", async (req, res) => {
    try {
      const stats = await storage.getMerkazTicketsStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching merkaz ticket stats:", error);
      res.status(500).json({ message: "Failed to fetch ticket stats" });
    }
  });
  app2.get("/api/merkaz-tickets/:id", async (req, res) => {
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
  app2.patch("/api/merkaz-tickets/:id", async (req, res) => {
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
  app2.delete("/api/merkaz-tickets/:id", async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      await storage.deleteTicket(ticketId);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting ticket:", error);
      res.status(500).json({ message: "Failed to delete ticket" });
    }
  });
  app2.get("/api/kabam-tickets", async (req, res) => {
    try {
      const { status, unit, rule, severity, page = "1", limit = "10" } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const ticketsList = await storage.getKabamTickets({ status, unit, rule, severity, skip, limit: parseInt(limit) });
      const totalCount = await storage.getKabamTicketsCount({ status, unit, rule, severity });
      res.json({ tickets: ticketsList, totalCount });
    } catch (error) {
      console.error("Error fetching kabam tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });
  app2.get("/api/kabam-tickets/stats", async (req, res) => {
    try {
      const stats = await storage.getKabamTicketsStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching kabam ticket stats:", error);
      res.status(500).json({ message: "Failed to fetch ticket stats" });
    }
  });
  app2.post("/api/media", async (req, res) => {
    try {
      const mediaData = insertMediaSchema.parse(req.body);
      const newMedia = await storage.createMedia(mediaData);
      res.status(201).json(newMedia);
    } catch (error) {
      console.error("Error uploading media:", error);
      res.status(400).json({ message: "Invalid media data" });
    }
  });
  app2.get("/api/media", async (req, res) => {
    try {
      const mediaList = await storage.getMediaList();
      res.json(mediaList);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });
  app2.get("/api/media/:id", async (req, res) => {
    try {
      const mediaId = parseInt(req.params.id);
      const media3 = await storage.getMedia(mediaId);
      if (!media3) {
        return res.status(404).json({ message: "Media not found" });
      }
      res.json(media3);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  base: "/Morp/",
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen(port, "localhost", () => {
    log(`serving on port ${port}`);
  });
})();
