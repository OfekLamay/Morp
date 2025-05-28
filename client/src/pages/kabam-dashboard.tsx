import { useState } from "react";
import { FileText, AlertTriangle, ZapIcon, Building } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Ticket } from "@shared/schema";

import StatCard from "@/components/dashboard/stat-card";
import CustomPieChart from "@/components/charts/pie-chart";
import { ExportButton } from "@/components/ui/export-button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

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

function useAllKabamTickets() {
  return useQuery<{ tickets: Ticket[] }>({
    queryKey: ["/api/kabam-tickets?limit=1000"],
  });
}

export default function KabamDashboard() {
  const [timePeriod, setTimePeriod] = useState("7"); // days

  // Fetch all tickets for kabam dashboard
  const { data: ticketsData, isLoading: isTicketsLoading } = useAllKabamTickets();
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

  // Tickets by Unit (instead of Kabam)
  const unitCounts: Record<string, number> = {};
  tickets.forEach(t => {
    const unit = t.unitRelated || "Unknown";
    unitCounts[unit] = (unitCounts[unit] || 0) + 1;
  });
  const unitData = Object.entries(unitCounts).map(([unit, count]) => ({
    unit,
    count,
  }));

  // Tickets by Severity
  const severityData = [
    { severity: 'Low (1-4)', count: tickets.filter(t => t.severity <= 4).length },
    { severity: 'Medium (5-7)', count: tickets.filter(t => t.severity >= 5 && t.severity <= 7).length },
    { severity: 'High (8-10)', count: tickets.filter(t => t.severity >= 8).length },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold ">Kabam Dashboard</h1>
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
          value={tickets.length}
          icon={FileText}
          change={{ value: "8%", positive: true }}
        />
        <StatCard
          title="High Severity (6+)"
          value={tickets.filter(t => t.severity >= 6).length}
          icon={AlertTriangle}
          iconColor="text-destructive"
          change={{ value: "5%", positive: false }}
        />
        <StatCard
          title="In Progress"
          value={tickets.filter(t => t.status?.toLowerCase() === "in progress").length}
          icon={ZapIcon}
          iconColor="text-secondary"
          change={{ value: "2%", positive: true }}
        />
        <StatCard
          title="Units Involved"
          value={unitData.length}
          icon={Building}
          iconColor="text-purple-500"
          change={{ value: "1", positive: true }}
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
              filename="kabam_ticket_status_distribution"
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
              filename="kabam_tickets_by_rule"
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
        {/* Tickets by Unit (Horizontal Bar Chart) */}
        <div className="grid-card overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="font-semibold mb-2">Tickets by Unit</h3>
            <ExportButton
              title="Tickets by Unit"
              headers={["Unit", "Count"]}
              data={unitData.map(item => ({
                "Unit": item.unit,
                "Count": item.count
              }))}
              filename="kabam_tickets_by_unit"
            />
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={unitData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis
                  dataKey="unit"
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
              filename="kabam_tickets_by_severity"
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
