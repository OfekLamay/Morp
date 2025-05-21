import { useState } from "react";
import { Link } from "wouter";
import { FileText, AlertTriangle, ZapIcon, Building, LineChart, MoreHorizontal } from "lucide-react";

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

export default function KabamDashboard() {
  const [timePeriod, setTimePeriod] = useState("7"); // days
  
  const { stats, isLoading: isStatsLoading } = useTicketStats(false);
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
    { rule: 'Location,Tel Aviv,C', count: 2 },
    { rule: 'Uniform,Officer,D', count: 2 },
    { rule: 'Location,Jerusalem,E', count: 2 },
    { rule: 'Uniform,Commander,F', count: 2 },
    { rule: 'Location,Haifa,G', count: 2 },
    { rule: 'Uniform,General,H', count: 2 },
    { rule: 'Location,Tel Aviv,I', count: 2 },
    { rule: 'Uniform,Soldier,J', count: 2 },
    { rule: 'Location,Jerusalem,K', count: 2 },
    { rule: 'Uniform,Officer,L', count: 2 }
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
    { name: "May 9", "R001-TP": 8, "R001-FP": 2, "R002-TP": 6, "R002-FP": 3 },
    { name: "May 10", "R001-TP": 5, "R001-FP": 3, "R002-TP": 7, "R002-FP": 2 },
    { name: "May 11", "R001-TP": 6, "R001-FP": 1, "R002-TP": 5, "R002-FP": 1 },
    { name: "May 12", "R001-TP": 9, "R001-FP": 3, "R002-TP": 7, "R002-FP": 2 },
    { name: "May 13", "R001-TP": 4, "R001-FP": 1, "R002-TP": 3, "R002-FP": 2 },
    { name: "May 14", "R001-TP": 10, "R001-FP": 2, "R002-TP": 5, "R002-FP": 3 },
    { name: "May 15", "R001-TP": 12, "R001-FP": 2, "R002-TP": 6, "R002-FP": 2 }
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
      id: 1085,
      status: "In Progress",
      severity: 7,
      rule: "R001",
      unit: "Unit 3",
      creationDate: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
    },
    {
      id: 1084,
      status: "Done",
      severity: 5,
      rule: "R003",
      unit: "Unit 1",
      creationDate: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
    },
    {
      id: 1083,
      status: "False Positive",
      severity: 4,
      rule: "R002",
      unit: "Unit 2",
      creationDate: new Date(Date.now() - 20 * 60 * 60 * 1000) // 20 hours ago
    },
    {
      id: 1082,
      status: "Waiting",
      severity: 8,
      rule: "R001",
      unit: "Unit 1",
      creationDate: new Date(Date.now() - 28 * 60 * 60 * 1000) // 1 day + 4 hours ago
    }
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
          value={stats?.totalCount || 140}
          icon={FileText}
          change={{ value: "8%", positive: true }}
        />
        <StatCard
          title="High Severity (6+)"
          value={stats?.highSeverityCount || 32}
          icon={AlertTriangle}
          iconColor="text-destructive"
          change={{ value: "5%", positive: false }}
        />
        <StatCard
          title="In Progress"
          value={stats?.inProgressCount || 23}
          icon={ZapIcon}
          iconColor="text-secondary"
          change={{ value: "2%", positive: true }}
        />
        <StatCard
          title="Units Involved"
          value={stats?.unitCount || 5}
          icon={Building}
          iconColor="text-purple-500"
          change={{ value: "1", positive: true }}
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
              filename="kabam_ticket_status_distribution"
              variant="outline"
              size="sm"
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
              filename="kabam_detection_trends_data"
              variant="outline"
              size="sm"
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tickets by Status (Pie Chart) */}
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-semibold mb-2">Tickets by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={[
                  { name: 'In Progress', value: 3, color: '#3b82f6' },
                  { name: 'Not Yet', value: 3, color: '#f59e42' },
                  { name: 'Waiting For Identification', value: 3, color: '#fbbf24' },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                label
              >
                <Cell fill="#3b82f6" />
                <Cell fill="#f59e42" />
                <Cell fill="#fbbf24" />
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tickets by Rule (Vertical Bar Chart) */}
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-semibold mb-2">Tickets by Rule</h3>
          <ResponsiveContainer width="100%" height={220}>
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
                label={{ value: "Rule", fill: "#000" }}
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
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tickets per Unit (Horizontal Bar Chart) */}
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-semibold mb-2">Tickets per Unit</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { unit: 'Unit 81', count: 2 },
              { unit: 'Unit 8200', count: 2 },
              { unit: 'Unit 504', count: 2 },
              { unit: 'Nahal', count: 2 },
              { unit: 'Givaati', count: 1 },
            ]} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="unit" type="category" />
              <Tooltip />
              <Bar dataKey="count" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tickets by Severity (Vertical Bar Chart) */}
        <div className="bg-white rounded shadow p-4">
          <h3 className="font-semibold mb-2">Tickets by Severity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { severity: 'Low (1-5)', count: 3, color: '#3b82f6' },
              { severity: 'Medium (6-8)', count: 3, color: '#fbbf24' },
              { severity: 'High (9-10)', count: 3, color: '#ef4444' },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="severity" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count">
                <Cell fill="#3b82f6" />
                <Cell fill="#fbbf24" />
                <Cell fill="#ef4444" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
