import { useState } from "react";
import { Link } from "wouter";
import { FileText, AlertTriangle, ZapIcon, Users, LineChart, MoreHorizontal } from "lucide-react";

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

export default function MerkazDashboard() {
  const [timePeriod, setTimePeriod] = useState("7"); // days
  
  const { stats, isLoading: isStatsLoading } = useTicketStats(true);
  const { performance, isLoading: isPerfLoading } = useRulesPerformance(undefined, timePeriod);
  
  // Demo data for pie chart with more distinct colors
  const statusData = [
    { name: 'Done', value: 10, color: '#38BDF8' },
    { name: 'In Progress', value: 8, color: '#10B981' },
    { name: 'FP', value: 6, color: '#A855F7' },
    { name: 'Waiting For Identification', value: 7, color: '#FB923C' },
    { name: 'Not Yet', value: 5, color: '#F43F5E' },
  ];

  const ruleData = [
    { rule: 'Location,Gaza,A', count: 2 },
    { rule: 'Uniform,Soldier,B', count: 2 },
    // ...more rules
  ];

  const kabamData = [
    { kabam: 'Kabam 98', count: 9 },
    { kabam: 'Kabam 162', count: 9 },
    { kabam: 'Kabam 122', count: 9 },
    { kabam: 'Kabam 144', count: 9 },
  ];

  const severityData = [
    { severity: 'Low (1-5)', count: 15 },
    { severity: 'Medium (6-8)', count: 15 },
    { severity: 'High (9-10)', count: 5 },
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
        
        <div className="grid-card overflow-hidden">
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-medium ">Detection Trends</h3>
            <ExportButton
              title="Detection Trends"
              headers={["Date", "R001 (TP)", "R001 (FP)", "R002 (TP)", "R002 (FP)"]}
              data={trendData.map(point => ({
                "Date": point.name,
                "R001 (TP)": point["R001-TP"],
                "R001 (FP)": point["R001-FP"],
                "R002 (TP)": point["R002-TP"],
                "R002 (FP)": point["R002-FP"],
              }))}
              filename="detection_trends_data"
            />
          </div>
          <div className="p-4">
            <CustomLineChart
              data={trendData}
              title=""
              lines={trendLines}
              height={280}
              yAxisLabel="Detections"
              xAxisLabel="Date"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Tickets by Status (Pie Chart) */}
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-semibold mb-2">Tickets by Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                label
              >
                {statusData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tickets by Rule (Vertical Bar Chart) */}
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-semibold mb-2">Tickets by Rule</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ruleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="rule"
                angle={-45}
                textAnchor="end"
                interval={0}
                height={60}
                stroke="#000" // <-- Make X axis labels black
                tick={{ fill: "#000" }} // <-- Make X axis tick labels black
                label={{ value: "Rule", fill: "#000" }} // <-- X axis label black
              />
              <YAxis
                stroke="#000" // <-- Make Y axis labels black
                tick={{ fill: "#000" }} // <-- Make Y axis tick labels black
                label={{ value: "Count", angle: -90, position: "insideLeft", fill: "#000" }} // <-- Y axis label black
              />
              <Tooltip
                contentStyle={{ color: "#000" }} // Tooltip text black
                labelStyle={{ color: "#000" }}
                itemStyle={{ color: "#000" }}
              />
              <Legend
                wrapperStyle={{ color: "#000" }} // Legend text black
              />
              <Bar dataKey="count">
                <Cell fill="#3b82f6" />
                <Cell fill="#fbbf24" />
                <Cell fill="#ef4444" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tickets by Kabam (Horizontal Bar Chart) */}
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-semibold mb-2">Tickets by Kabam</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={kabamData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="kabam" type="category" />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tickets by Severity (Grouped Bar Chart) */}
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-semibold mb-2">Tickets by Severity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={severityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="severity" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
