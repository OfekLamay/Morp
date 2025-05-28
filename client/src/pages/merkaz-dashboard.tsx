import { useState } from "react";
import { Link } from "wouter";
import { FileText, AlertTriangle, ZapIcon, Users, LineChart, MoreHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Ticket } from "@shared/schema";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import StatCard from "@/components/dashboard/stat-card";
import CustomPieChart from "@/components/charts/pie-chart";
import CustomLineChart from "@/components/charts/line-chart";
import StatusBadge from "@/components/ui/status-badge";
import SeverityIndicator from "@/components/ui/severity-indicator";
import { ExportButton } from "@/components/ui/export-button";

import { formatDate, formatId } from "@/lib/utils";
import { useTicketStats } from "@/hooks/use-tickets";
import { useRulesPerformance } from "@/hooks/use-rules";

import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function useAllTickets() {
  return useQuery<{ tickets: Ticket[] }>({
    queryKey: ["/api/merkaz-tickets?limit=1000"],
  });
}

const BAR_COLORS = [
  "#2563eb", // blue
  "#fbbf24", // yellow
  "#10b981", // green
  "#f43f5e", // red
  "#a855f7", // purple
  "#fb923c", // orange
  "#38bdf8", // sky blue
  "#6366f1", // indigo
  "#22d3ee", // cyan
  "#84cc16", // lime
];

export default function MerkazDashboard() {
  const [timePeriod, setTimePeriod] = useState("7"); // days
  
  const { stats, isLoading: isStatsLoading } = useTicketStats(true);
  const { performance, isLoading: isPerfLoading } = useRulesPerformance(undefined, timePeriod);
  const { data: ticketsData, isLoading: isTicketsLoading } = useAllTickets();
  const tickets = ticketsData?.tickets || [];

  // Status Distribution
  const statusData = [
    { name: 'Done', value: tickets.filter(t => t.status?.toLowerCase() === 'done').length, color: '#38BDF8' },
    { name: 'In Progress', value: tickets.filter(t => t.status?.toLowerCase() === 'in progress').length, color: '#10B981' },
    { name: 'FP', value: tickets.filter(t => ['fp', 'false positive'].includes(t.status?.toLowerCase())).length, color: '#A855F7' },
    { name: 'Waiting For Identification', value: tickets.filter(t => t.status?.toLowerCase() === 'waiting for identification').length, color: '#FB923C' },
    { name: 'Not Yet', value: tickets.filter(t => ['not related yet', 'not yet'].includes(t.status?.toLowerCase())).length, color: '#F43F5E' },
  ];

  // Tickets by Rule
  const ruleCounts: Record<string, number> = {};
  tickets.forEach(t => {
    (t.relatedRulesList || []).forEach(ruleId => {
      ruleCounts[ruleId] = (ruleCounts[ruleId] || 0) + 1;
    });
  });
  const ruleData = Object.entries(ruleCounts).map(([rule, count]) => ({
    rule: `R${String(rule).padStart(3, "0")}`,
    count,
  }));

  // Tickets by Kabam
  const kabamCounts: Record<string, number> = {};
  tickets.forEach(t => {
    const kabam = t.kabamRelated || "Unknown";
    kabamCounts[kabam] = (kabamCounts[kabam] || 0) + 1;
  });
  const kabamData = Object.entries(kabamCounts).map(([kabam, count]) => ({
    kabam,
    count,
  }));

  // Tickets by Severity
  const severityData = [
    { severity: 'Low (1-4)', count: tickets.filter(t => t.severity <= 4).length },
    { severity: 'Medium (5-7)', count: tickets.filter(t => t.severity >= 5 && t.severity <= 7).length },
    { severity: 'High (8-10)', count: tickets.filter(t => t.severity >= 8).length },
  ];
  
  // Demo data for line chart
  const trendData = [
    { name: "May 9", "R001-TP": 15, "R001-FP": 3, "R002-TP": 12, "R002-FP": 5 },
    { name: "May 10", "R001-TP": 8, "R001-FP": 4, "R002-TP": 10, "R002-FP": 3 },
    { name: "May 11", "R001-TP": 10, "R001-FP": 2, "R002-TP": 11, "R002-FP": 2 },
    { name: "May 12", "R001-TP": 15, "R001-FP": 5, "R002-TP": 13, "R002-FP": 4 },
    { name: "May 13", "R001-TP": 9, "R001-FP": 2, "R002-TP": 6, "R002-FP": 3 },
    { name: "May 14", "R001-TP": 18, "R001-FP": 4, "R002-TP": 9, "R002-FP": 5 },
    { name: "May 15", "R001-TP": 20, "R001-FP": 3, "R002-TP": 11, "R002-FP": 4 }
  ];
  
  const trendLines = [
    { id: "R001-TP", name: "R001 (TP)", color: "#38BDF8" }, // Bright blue
    { id: "R001-FP", name: "R001 (FP)", color: "#F43F5E" }, // Pink/Red
    { id: "R002-TP", name: "R002 (TP)", color: "#10B981" }, // Green
    { id: "R002-FP", name: "R002 (FP)", color: "#A855F7" }  // Purple
  ];
  
  // Recent tickets demo data
  const recentTickets = [
    {
      id: 1092,
      status: "In Progress",
      severity: 8,
      rule: "R001",
      kabam: "Kabam A",
      creationDate: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      id: 1091,
      status: "Done",
      severity: 6,
      rule: "R002",
      kabam: "Kabam B",
      creationDate: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
    },
    {
      id: 1090,
      status: "False Positive",
      severity: 3,
      rule: "R001",
      kabam: "Kabam C",
      creationDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    },
    {
      id: 1089,
      status: "Waiting",
      severity: 9,
      rule: "R002",
      kabam: "Kabam A",
      creationDate: new Date(Date.now() - 26 * 60 * 60 * 1000) // 1 day + 2 hours ago
    }
  ];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold ">Merkaz Dashboard</h1>
        <div className="flex space-x-2">
          <Select
            value={timePeriod}
            onValueChange={setTimePeriod}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Tickets"
          value={stats?.totalCount || 286}
          icon={FileText}
          change={{ value: "12%", positive: true }}
        />
        <StatCard
          title="High Severity (6+)"
          value={stats?.highSeverityCount || 64}
          icon={AlertTriangle}
          iconColor="text-destructive"
          change={{ value: "8%", positive: false }}
        />
        <StatCard
          title="In Progress"
          value={stats?.inProgressCount || 42}
          icon={ZapIcon}
          iconColor="text-secondary"
          change={{ value: "3%", positive: true }}
        />
        <StatCard
          title="Kabam Users"
          value={stats?.kabamUserCount || 18}
          icon={Users}
          iconColor="text-purple-500"
          change={{ value: "2", positive: true }}
          className="orange-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tickets status distribution */}
        <div className="grid-card overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-medium ">Ticket Status Distribution</h3>
            <ExportButton
              title="Ticket Status Distribution"
              headers={["Status", "Count", "Percentage"]}
              data={statusData.map(item => ({
                "Status": item.name,
                "Count": item.value,
                "Percentage": `${((item.value / statusData.reduce((sum, i) => sum + i.value, 0)) * 100).toFixed(1)}%`
              }))}
              filename="ticket_status_distribution"
            />
          </div>
          <div className="p-4">
            <CustomPieChart 
              data={statusData}
              title=""
              height={280}
            />
          </div>
        </div>
        
        {/* Tickets by Rule (Vertical Bar Chart) */}
        <div className="grid-card overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-medium">Tickets by Rule</h3>
            <ExportButton
              title="Tickets by Rule"
              headers={["Rule", "Count"]}
              data={ruleData.map(item => ({
                "Rule": item.rule,
                "Count": item.count
              }))}
              filename="tickets_by_rule"
            />
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={ruleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="rule"
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={60}
                  stroke="#000"
                  tick={{ fill: "#000" }}
                />
                <YAxis
                  stroke="#000"
                  tick={{ fill: "#000" }}
                  label={{ value: "Count", angle: -90, position: "insideLeft", fill: "#000" }}
                />
                <Tooltip
                  contentStyle={{ color: "#000" }}
                  labelStyle={{ color: "#000" }}
                  itemStyle={{ color: "#000" }}
                />
                <Bar dataKey="count">
                  {ruleData.map((entry, idx) => (
                    <Cell key={`cell-rule-${idx}`} fill={BAR_COLORS[idx % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Tickets by Kabam (Horizontal Bar Chart) */}
        <div className="grid-card overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold mb-2">Tickets by Kabam</h3>
            <ExportButton
              title="Tickets by Kabam"
              headers={["Kabam", "Count"]}
              data={kabamData.map(item => ({
                "Kabam": item.kabam,
                "Count": item.count
              }))}
              filename="tickets_by_kabam"
            />
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={kabamData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  dataKey="kabam"
                  type="category"
                  label={{
                    angle: -90,
                    position: "insideLeft",
                    fill: "#000",
                    fontSize: 14,
                    dy: 60 // adjust as needed
                  }}
                  tick={{ fill: "#6b7280", fontSize: 14 }}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tickets by Severity (Grouped Bar Chart) */}
        <div className="grid-card overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold mb-2">Tickets by Severity</h3>
            <ExportButton
              title="Tickets by Severity"
              headers={["Severity", "Count"]}
              data={severityData.map(item => ({
                "Severity": item.severity,
                "Count": item.count
              }))}
              filename="tickets_by_severity"
            />
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="severity" tick={{ fill: "#6b7280", fontSize: 14 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 14 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
