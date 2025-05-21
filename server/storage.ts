import { users, type User, type InsertUser } from "@shared/schema";
import { rules, type Rule, type InsertRule } from "@shared/schema";
import { tickets, type Ticket, type InsertTicket } from "@shared/schema";
import { media, type Media, type InsertMedia } from "@shared/schema";
import { eq, like, gte, lte, and, or, not, desc, asc, inArray } from "drizzle-orm";
import { randomBytes } from "crypto";

// Filter types
type UsersFilter = {
  search?: string;
  group?: string;
  skip?: number;
  limit?: number;
};

type RulesFilter = {
  search?: string;
  enforcement?: string;
  severity?: string;
  date?: string;
  skip?: number;
  limit?: number;
};

type TicketsFilter = {
  status?: string;
  kabam?: string;
  unit?: string;
  rule?: string;
  severity?: string;
  skip?: number;
  limit?: number;
};

// Stats type
type TicketsStats = {
  totalCount: number;
  highSeverityCount: number;
  inProgressCount: number;
  kabamUserCount?: number;
  unitCount?: number;
  statusDistribution: Record<string, number>;
};

// Performance type
type RulesPerformance = {
  topRules: {
    id: number;
    description: string;
    ticketCount: number;
    truePositiveRate: number;
    falsePositiveRate: number;
    avgResolutionTime: number;
  }[];
  performanceOverTime: {
    date: string;
    ruleData: {
      ruleId: number;
      truePositives: number;
      falsePositives: number;
    }[];
  }[];
  monthlyComparison: {
    ruleId: number;
    prevTickets: number;
    currTickets: number;
    prevTruePositiveRate: number;
    currTruePositiveRate: number;
    trend: "improving" | "declining" | "stable";
  }[];
};

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(filters?: UsersFilter): Promise<User[]>;
  getUsersCount(filters?: UsersFilter): Promise<number>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<void>;
  resetUserPassword(id: number): Promise<string>;
  
  // Rule methods
  getRule(id: number): Promise<Rule | undefined>;
  getRules(filters?: RulesFilter): Promise<Rule[]>;
  getRulesCount(filters?: RulesFilter): Promise<number>;
  createRule(rule: InsertRule): Promise<Rule>;
  updateRule(id: number, ruleData: Partial<Rule>): Promise<Rule | undefined>;
  deleteRule(id: number): Promise<void>;
  getRulesPerformance(ruleIds?: number[], period?: number): Promise<RulesPerformance>;
  
  // Ticket methods
  getTicket(id: number): Promise<Ticket | undefined>;
  getMerkazTickets(filters?: TicketsFilter): Promise<Ticket[]>;
  getMerkazTicketsCount(filters?: TicketsFilter): Promise<number>;
  getKabamTickets(filters?: TicketsFilter): Promise<Ticket[]>;
  getKabamTicketsCount(filters?: TicketsFilter): Promise<number>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicket(id: number, ticketData: Partial<Ticket>): Promise<Ticket | undefined>;
  deleteTicket(id: number): Promise<void>;
  getMerkazTicketsStats(): Promise<TicketsStats>;
  getKabamTicketsStats(): Promise<TicketsStats>;
  
  // Media methods
  getMedia(id: number): Promise<Media | undefined>;
  getMediaList(): Promise<Media[]>;
  createMedia(media: InsertMedia): Promise<Media>;
}

export class MemStorage implements IStorage {
  private usersData: Map<number, User>;
  private rulesData: Map<number, Rule>;
  private ticketsData: Map<number, Ticket>;
  private mediaData: Map<number, Media>;
  
  private userCurrentId: number;
  private ruleCurrentId: number;
  private ticketCurrentId: number;
  private mediaCurrentId: number;

  constructor() {
    this.usersData = new Map();
    this.rulesData = new Map();
    this.ticketsData = new Map();
    this.mediaData = new Map();
    
    this.userCurrentId = 1;
    this.ruleCurrentId = 1;
    this.ticketCurrentId = 1;
    this.mediaCurrentId = 1;
    
    // Initialize with some sample data
    this.seedData();
  }

  private seedData() {
    // Seed some sample users
    const sampleUsers: InsertUser[] = [
      {
        fullName: "John Smith",
        username: "jsmith",
        email: "jsmith@example.com",
        password: "password123",
        permissionGroup: "System Administrator",
        isManager: true,
        kabam: "",
        ticketsManaging: 0,
        unitsUnder: "",
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
        unitsUnder: "",
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
        unitsUnder: "Unit 1,Unit 2",
      },
    ];

    sampleUsers.forEach(user => this.createUser(user));

    // Seed some sample rules
    const sampleRules: InsertRule[] = [
      {
        creationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        itemsList: ["shoes", "jeans", "t-shirt"],
        description: "Detect suspicious location patterns",
        enforcement: "ACTIVE",
        userCreated: "jsmith",
        managerApproved: "sjohnson",
        importance: 8,
        usersRelatedTo: ["dlee", "sjohnson"],
        enabled: true,
      },
      {
        creationDate: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        itemsList: ["phone", "laptop", "wifi"],
        description: "Monitor high-risk communications",
        enforcement: "ACTIVE",
        userCreated: "sjohnson",
        managerApproved: "jsmith",
        importance: 9,
        usersRelatedTo: ["dlee"],
        enabled: true,
      },
      {
        creationDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        itemsList: ["file", "usb", "document"],
        description: "Identify unusual file transfers",
        enforcement: "SILENT",
        userCreated: "dlee",
        managerApproved: "",
        importance: 5,
        usersRelatedTo: [],
        enabled: true,
      },
    ];

    sampleRules.forEach(rule => this.createRule(rule));

    // Seed some sample tickets
    const sampleTickets: InsertTicket[] = [
      {
        expirationDate: new Date(Date.now() + 8 * 60 * 60 * 1000),
        userGatheredFrom: "user123",
        relatedRulesList: [1],
        importance: 8,
        status: "in progress",
        kabamRelated: "Kabam A",
        unitRelated: "Unit 1",
      },
      {
        expirationDate: new Date(Date.now() + 6 * 60 * 60 * 1000),
        userGatheredFrom: "user456",
        relatedRulesList: [2],
        importance: 6,
        status: "done",
        kabamRelated: "Kabam B",
        unitRelated: "Unit 3",
      },
      {
        expirationDate: new Date(Date.now() - 4 * 60 * 60 * 1000),
        userGatheredFrom: "user789",
        relatedRulesList: [1],
        importance: 3,
        status: "false positive",
        kabamRelated: "Kabam C",
        unitRelated: "Unit 2",
      },
    ];

    sampleTickets.forEach(ticket => this.createTicket(ticket));

    const demoTickets = [
      {
        userGatheredFrom: "user123",
        userManaging: "admin1",
        creationDate: new Date(),
        expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        relatedRulesList: [1],
        severity: 9,
        status: "done",
        isTruePositive: true,
        kabamRelated: "Kabam A",
        unitRelated: "Unit 81",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Matrix-ASCII.jpg"
      },
      {
        userGatheredFrom: "user456",
        userManaging: "admin2",
        creationDate: new Date(),
        expirationDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
        relatedRulesList: [2],
        severity: 6,
        status: "in progress",
        isTruePositive: false,
        kabamRelated: "Kabam B",
        unitRelated: "Unit 8200",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Matrix-ASCII.jpg"
      },
      {
        userGatheredFrom: "user623",
        userManaging: "admin7",
        creationDate: new Date(Date.now() - 3 * 60 * 60 * 1000),
        expirationDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
        relatedRulesList: [2],
        severity: 9,
        status: "in progress",
        isTruePositive: false,
        kabamRelated: "Kabam 162",
        unitRelated: "Unit 3412",
        imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSE0ZEM0Spbv4-MtOZfsnptKosA4SUsYtyBuw&s"
      },
      {
        userGatheredFrom: "user789",
        userManaging: "admin3",
        creationDate: new Date(),
        expirationDate: new Date(Date.now() + 72 * 60 * 60 * 1000),
        relatedRulesList: [3],
        severity: 3,
        status: "false positive",
        isTruePositive: false,
        kabamRelated: "Kabam C",
        unitRelated: "Unit 504",
        imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Matrix-ASCII.jpg"
      }
    ];
    
    demoTickets.forEach(ticket => this.createTicket(ticket));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersData.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersData.values()).find(
      (user) => user.username === username,
    );
  }

  async getUsers(filters: UsersFilter = {}): Promise<User[]> {
    let users = Array.from(this.usersData.values());
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      users = users.filter(user => 
        user.fullName.toLowerCase().includes(searchLower) || 
        user.username.toLowerCase().includes(searchLower) || 
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.group) {
      users = users.filter(user => user.permissionGroup === filters.group);
    }
    
    // Sort by id descending
    users.sort((a, b) => b.id - a.id);
    
    // Apply pagination
    if (filters.skip !== undefined && filters.limit !== undefined) {
      users = users.slice(filters.skip, filters.skip + filters.limit);
    }
    
    return users;
  }

  async getUsersCount(filters: UsersFilter = {}): Promise<number> {
    let users = Array.from(this.usersData.values());
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      users = users.filter(user => 
        user.fullName.toLowerCase().includes(searchLower) || 
        user.username.toLowerCase().includes(searchLower) || 
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.group) {
      users = users.filter(user => user.permissionGroup === filters.group);
    }
    
    return users.length;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      lastLogin: null,
      createdAt: now 
    };
    this.usersData.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.usersData.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.usersData.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    this.usersData.delete(id);
  }

  async resetUserPassword(id: number): Promise<string> {
    const user = this.usersData.get(id);
    if (!user) throw new Error("User not found");
    
    // Generate temporary password
    const tempPassword = randomBytes(4).toString('hex');
    user.password = tempPassword;
    this.usersData.set(id, user);
    
    return tempPassword;
  }

  // Rule methods
  async getRule(id: number): Promise<Rule | undefined> {
    return this.rulesData.get(id);
  }

  async getRules(filters: RulesFilter = {}): Promise<Rule[]> {
    let rules = Array.from(this.rulesData.values());
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      rules = rules.filter(rule => 
        rule.description.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.enforcement) {
      if (filters.enforcement === 'disabled') {
        rules = rules.filter(rule => !rule.enabled);
      } else {
        rules = rules.filter(rule => 
          rule.enabled && rule.enforcement === filters.enforcement
        );
      }
    }
    
    if (filters.severity) {
      switch(filters.severity) {
        case 'high':
          rules = rules.filter(rule => rule.importance >= 8);
          break;
        case 'medium':
          rules = rules.filter(rule => rule.importance >= 5 && rule.importance <= 7);
          break;
        case 'low':
          rules = rules.filter(rule => rule.importance <= 4);
          break;
      }
    }
    
    if (filters.date) {
      const filterDate = new Date(filters.date);
      rules = rules.filter(rule => {
        const ruleDate = new Date(rule.creationDate);
        return ruleDate.toDateString() === filterDate.toDateString();
      });
    }
    
    // Sort by id descending
    rules.sort((a, b) => b.id - a.id);
    
    // Apply pagination
    if (filters.skip !== undefined && filters.limit !== undefined) {
      rules = rules.slice(filters.skip, filters.skip + filters.limit);
    }
    
    return rules;
  }

  async getRulesCount(filters: RulesFilter = {}): Promise<number> {
    let rules = Array.from(this.rulesData.values());
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      rules = rules.filter(rule => 
        rule.description.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.enforcement) {
      if (filters.enforcement === 'disabled') {
        rules = rules.filter(rule => !rule.enabled);
      } else {
        rules = rules.filter(rule => 
          rule.enabled && rule.enforcement === filters.enforcement
        );
      }
    }
    
    if (filters.severity) {
      switch(filters.severity) {
        case 'high':
          rules = rules.filter(rule => rule.importance >= 8);
          break;
        case 'medium':
          rules = rules.filter(rule => rule.importance >= 5 && rule.importance <= 7);
          break;
        case 'low':
          rules = rules.filter(rule => rule.importance <= 4);
          break;
      }
    }
    
    if (filters.date) {
      const filterDate = new Date(filters.date);
      rules = rules.filter(rule => {
        const ruleDate = new Date(rule.creationDate);
        return ruleDate.toDateString() === filterDate.toDateString();
      });
    }
    
    return rules.length;
  }

  async createRule(insertRule: InsertRule): Promise<Rule> {
    const id = this.ruleCurrentId++;
    const rule: Rule = { 
      ...insertRule, 
      id,
      creationDate: insertRule.creationDate || new Date()
    };
    this.rulesData.set(id, rule);
    return rule;
  }

  async updateRule(id: number, ruleData: Partial<Rule>): Promise<Rule | undefined> {
    const rule = this.rulesData.get(id);
    if (!rule) return undefined;
    
    const updatedRule = { ...rule, ...ruleData };
    this.rulesData.set(id, updatedRule);
    return updatedRule;
  }

  async deleteRule(id: number): Promise<void> {
    this.rulesData.delete(id);
  }

  async getRulesPerformance(ruleIds?: number[], period: number = 7): Promise<RulesPerformance> {
    // Get all rules or filter by ID
    let rules = Array.from(this.rulesData.values());
    if (ruleIds && ruleIds.length > 0) {
      rules = rules.filter(rule => ruleIds.includes(rule.id));
    }
    
    // Get all tickets from the relevant time period
    const periodStart = new Date(Date.now() - period * 24 * 60 * 60 * 1000);
    const tickets = Array.from(this.ticketsData.values()).filter(ticket => {
      const ticketDate = new Date(ticket.creationDate);
      return ticketDate >= periodStart;
    });
    
    // Calculate performance metrics for each rule
    const topRules = rules.map(rule => {
      // Get tickets related to this rule
      const ruleTickets = tickets.filter(ticket => 
        ticket.relatedRulesList.includes(rule.id)
      );
      
      // Count true and false positives
      const truePositives = ruleTickets.filter(ticket => ticket.isTruePositive).length;
      const falsePositives = ruleTickets.filter(ticket => !ticket.isTruePositive).length;
      const totalTickets = ruleTickets.length;
      
      // Calculate rates
      const truePositiveRate = totalTickets > 0 ? (truePositives / totalTickets) * 100 : 0;
      const falsePositiveRate = totalTickets > 0 ? (falsePositives / totalTickets) * 100 : 0;
      
      // Calculate average resolution time (in hours)
      // For demo purposes, we'll use a random value between 2 and 6 hours
      const avgResolutionTime = 2 + Math.random() * 4;
      
      return {
        id: rule.id,
        description: rule.description,
        ticketCount: totalTickets,
        truePositiveRate: parseFloat(truePositiveRate.toFixed(1)),
        falsePositiveRate: parseFloat(falsePositiveRate.toFixed(1)),
        avgResolutionTime: parseFloat(avgResolutionTime.toFixed(1)),
      };
    });
    
    // Sort by ticket count descending
    topRules.sort((a, b) => b.ticketCount - a.ticketCount);
    
    // Generate performance over time data
    const performanceOverTime = [];
    for (let i = 0; i < period; i++) {
      const date = new Date(Date.now() - (period - i - 1) * 24 * 60 * 60 * 1000);
      const dateString = date.toISOString().split('T')[0];
      
      const ruleData = rules.map(rule => {
        // For demo purposes, we'll generate random values
        const truePositives = Math.floor(Math.random() * 15) + 5;
        const falsePositives = Math.floor(Math.random() * 5) + 1;
        
        return {
          ruleId: rule.id,
          truePositives,
          falsePositives,
        };
      });
      
      performanceOverTime.push({
        date: dateString,
        ruleData,
      });
    }
    
    // Generate monthly comparison data
    const monthlyComparison = rules.map(rule => {
      // For demo purposes, we'll generate random values
      const prevTickets = Math.floor(Math.random() * 100) + 20;
      const currTickets = Math.floor(Math.random() * 100) + 20;
      
      const prevTruePositiveRate = Math.floor(Math.random() * 20) + 60;
      const currTruePositiveRate = Math.floor(Math.random() * 20) + 60;
      
      // Determine trend
      let trend: "improving" | "declining" | "stable";
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
        trend,
      };
    });
    
    return {
      topRules,
      performanceOverTime,
      monthlyComparison,
    };
  }

  // Ticket methods
  async getTicket(id: number): Promise<Ticket | undefined> {
    return this.ticketsData.get(id);
  }

  async getMerkazTickets(filters: TicketsFilter = {}): Promise<Ticket[]> {
    let tickets = Array.from(this.ticketsData.values());
    
    if (filters.status) {
      tickets = tickets.filter(ticket => ticket.status === filters.status);
    }
    
    if (filters.kabam) {
      tickets = tickets.filter(ticket => ticket.kabamRelated === filters.kabam);
    }
    
    if (filters.rule) {
      const ruleId = parseInt(filters.rule);
      tickets = tickets.filter(ticket => ticket.relatedRulesList.includes(ruleId));
    }
    
    if (filters.severity) {
      switch(filters.severity) {
        case 'high':
          tickets = tickets.filter(ticket => ticket.importance >= 8);
          break;
        case 'medium':
          tickets = tickets.filter(ticket => ticket.importance >= 5 && ticket.importance <= 7);
          break;
        case 'low':
          tickets = tickets.filter(ticket => ticket.importance <= 4);
          break;
      }
    }
    
    // Sort by id descending
    tickets.sort((a, b) => b.id - a.id);
    
    // Apply pagination
    if (filters.skip !== undefined && filters.limit !== undefined) {
      tickets = tickets.slice(filters.skip, filters.skip + filters.limit);
    }
    
    return tickets;
  }

  async getMerkazTicketsCount(filters: TicketsFilter = {}): Promise<number> {
    let tickets = Array.from(this.ticketsData.values());
    
    if (filters.status) {
      tickets = tickets.filter(ticket => ticket.status === filters.status);
    }
    
    if (filters.kabam) {
      tickets = tickets.filter(ticket => ticket.kabamRelated === filters.kabam);
    }
    
    if (filters.rule) {
      const ruleId = parseInt(filters.rule);
      tickets = tickets.filter(ticket => ticket.relatedRulesList.includes(ruleId));
    }
    
    if (filters.severity) {
      switch(filters.severity) {
        case 'high':
          tickets = tickets.filter(ticket => ticket.importance >= 8);
          break;
        case 'medium':
          tickets = tickets.filter(ticket => ticket.importance >= 5 && ticket.importance <= 7);
          break;
        case 'low':
          tickets = tickets.filter(ticket => ticket.importance <= 4);
          break;
      }
    }
    
    return tickets.length;
  }

  async getKabamTickets(filters: TicketsFilter = {}): Promise<Ticket[]> {
    let tickets = Array.from(this.ticketsData.values());
    
    if (filters.status) {
      tickets = tickets.filter(ticket => ticket.status === filters.status);
    }
    
    if (filters.unit) {
      tickets = tickets.filter(ticket => ticket.unitRelated === filters.unit);
    }
    
    if (filters.rule) {
      const ruleId = parseInt(filters.rule);
      tickets = tickets.filter(ticket => ticket.relatedRulesList.includes(ruleId));
    }
    
    if (filters.severity) {
      switch(filters.severity) {
        case 'high':
          tickets = tickets.filter(ticket => ticket.importance >= 8);
          break;
        case 'medium':
          tickets = tickets.filter(ticket => ticket.importance >= 5 && ticket.importance <= 7);
          break;
        case 'low':
          tickets = tickets.filter(ticket => ticket.importance <= 4);
          break;
      }
    }
    
    // Sort by id descending
    tickets.sort((a, b) => b.id - a.id);
    
    // Apply pagination
    if (filters.skip !== undefined && filters.limit !== undefined) {
      tickets = tickets.slice(filters.skip, filters.skip + filters.limit);
    }
    
    return tickets;
  }

  async getKabamTicketsCount(filters: TicketsFilter = {}): Promise<number> {
    let tickets = Array.from(this.ticketsData.values());
    
    if (filters.status) {
      tickets = tickets.filter(ticket => ticket.status === filters.status);
    }
    
    if (filters.unit) {
      tickets = tickets.filter(ticket => ticket.unitRelated === filters.unit);
    }
    
    if (filters.rule) {
      const ruleId = parseInt(filters.rule);
      tickets = tickets.filter(ticket => ticket.relatedRulesList.includes(ruleId));
    }
    
    if (filters.severity) {
      switch(filters.severity) {
        case 'high':
          tickets = tickets.filter(ticket => ticket.importance >= 8);
          break;
        case 'medium':
          tickets = tickets.filter(ticket => ticket.importance >= 5 && ticket.importance <= 7);
          break;
        case 'low':
          tickets = tickets.filter(ticket => ticket.importance <= 4);
          break;
      }
    }
    
    return tickets.length;
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const id = this.ticketCurrentId++;
    const now = new Date();
    const ticket: Ticket = { 
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

  async updateTicket(id: number, ticketData: Partial<Ticket>): Promise<Ticket | undefined> {
    const ticket = this.ticketsData.get(id);
    if (!ticket) return undefined;
    
    const updatedTicket = { ...ticket, ...ticketData };
    this.ticketsData.set(id, updatedTicket);
    return updatedTicket;
  }

  async deleteTicket(id: number): Promise<void> {
    this.ticketsData.delete(id);
  }

  async getMerkazTicketsStats(): Promise<TicketsStats> {
    const tickets = Array.from(this.ticketsData.values());
    
    // Count total tickets
    const totalCount = tickets.length;
    
    // Count high severity tickets
    const highSeverityCount = tickets.filter(ticket => ticket.importance >= 6).length;
    
    // Count in progress tickets
    const inProgressCount = tickets.filter(ticket => ticket.status === "in progress").length;
    
    // Count unique kabam users
    const kabamSet = new Set<string>();
    tickets.forEach(ticket => {
      if (ticket.kabamRelated && ticket.kabamRelated !== "need to be related") {
        kabamSet.add(ticket.kabamRelated);
      }
    });
    const kabamUserCount = kabamSet.size;
    
    // Count status distribution
    const statusDistribution: Record<string, number> = {};
    tickets.forEach(ticket => {
      statusDistribution[ticket.status] = (statusDistribution[ticket.status] || 0) + 1;
    });
    
    return {
      totalCount,
      highSeverityCount,
      inProgressCount,
      kabamUserCount,
      statusDistribution,
    };
  }

  async getKabamTicketsStats(): Promise<TicketsStats> {
    const tickets = Array.from(this.ticketsData.values());
    
    // Count total tickets
    const totalCount = tickets.length;
    
    // Count high severity tickets
    const highSeverityCount = tickets.filter(ticket => ticket.importance >= 6).length;
    
    // Count in progress tickets
    const inProgressCount = tickets.filter(ticket => ticket.status === "in progress").length;
    
    // Count unique units
    const unitSet = new Set<string>();
    tickets.forEach(ticket => {
      if (ticket.unitRelated && ticket.unitRelated !== "need to be related") {
        unitSet.add(ticket.unitRelated);
      }
    });
    const unitCount = unitSet.size;
    
    // Count status distribution
    const statusDistribution: Record<string, number> = {};
    tickets.forEach(ticket => {
      statusDistribution[ticket.status] = (statusDistribution[ticket.status] || 0) + 1;
    });
    
    return {
      totalCount,
      highSeverityCount,
      inProgressCount,
      unitCount,
      statusDistribution,
    };
  }

  // Media methods
  async getMedia(id: number): Promise<Media | undefined> {
    return this.mediaData.get(id);
  }

  async getMediaList(): Promise<Media[]> {
    return Array.from(this.mediaData.values());
  }

  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const id = this.mediaCurrentId++;
    const media: Media = { 
      ...insertMedia, 
      id,
      createdAt: new Date()
    };
    this.mediaData.set(id, media);
    return media;
  }
}

export const storage = new MemStorage();
