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

export default function KabamDashboard() {
  const [timePeriod, setTimePeriod] = useState("7"); // days
  
  const { stats, isLoading: isStatsLoading } = useTicketStats(false);
  const { performance, isLoading: isPerfLoading } = useRulesPerformance(undefined, timePeriod);
  
  // Demo data for pie chart with more distinct colors
  const statusData = [
    { name: "Done", value: stats?.statusDistribution?.done || 62, color: "#38BDF8" }, // Bright blue
    { name: "In Progress", value: stats?.statusDistribution?.["in progress"] || 35, color: "#10B981" }, // Green
    { name: "False Positive", value: stats?.statusDistribution?.["false positive"] || 23, color: "#F43F5E" }, // Pink/Red
    { name: "Waiting", value: stats?.statusDistribution?.waiting || 16, color: "#FB923C" }, // Orange
    { name: "Not Related Yet", value: stats?.statusDistribution?.["not related yet"] || 8, color: "#A855F7" } // Purple
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
        <h1 className="text-2xl font-semibold text-foreground">Kabam Dashboard</h1>
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
            <h3 className="text-lg font-medium text-foreground">Ticket Status Distribution</h3>
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
            <h3 className="text-lg font-medium text-foreground">Detection Trends</h3>
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

      {/* Rules Performance Cards */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-foreground">Rules Performance</h2>
        <ExportButton
          title="Kabam Rules Performance Overview"
          headers={["Rule", "Description", "Total Cases", "True Positive Rate", "False Positive Rate", "Avg. Resolution Time"]}
          data={[
            {
              "Rule": "R001",
              "Description": "Detect suspicious location patterns",
              "Total Cases": 76,
              "True Positive Rate": "82.5%",
              "False Positive Rate": "17.5%",
              "Avg. Resolution Time": "3.8h"
            },
            {
              "Rule": "R002",
              "Description": "Monitor high-risk communications",
              "Total Cases": 42,
              "True Positive Rate": "78.6%",
              "False Positive Rate": "21.4%",
              "Avg. Resolution Time": "4.2h"
            }
          ]}
          filename="kabam_rules_performance"
          variant="outline"
          size="sm"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Demo data for rule performance */}
        <Card className="p-5">
          <h3 className="text-lg font-medium text-foreground mb-4">
            R001: Detect suspicious location patterns
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card p-3 rounded border border-border">
              <p className="text-sm text-muted-foreground">Total Cases</p>
              <p className="text-2xl font-semibold text-foreground">76</p>
            </div>
            <div className="bg-card p-3 rounded border border-border">
              <p className="text-sm text-muted-foreground">True Positive Rate</p>
              <p className="text-2xl font-semibold text-primary">82.5%</p>
            </div>
            <div className="bg-card p-3 rounded border border-border">
              <p className="text-sm text-muted-foreground">False Positive Rate</p>
              <p className="text-2xl font-semibold text-destructive">17.5%</p>
            </div>
            <div className="bg-card p-3 rounded border border-border">
              <p className="text-sm text-muted-foreground">Avg. Resolution Time</p>
              <p className="text-2xl font-semibold text-foreground">3.8h</p>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-lg font-medium text-foreground mb-4">
            R002: Monitor high-risk communications
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card p-3 rounded border border-border">
              <p className="text-sm text-muted-foreground">Total Cases</p>
              <p className="text-2xl font-semibold text-foreground">42</p>
            </div>
            <div className="bg-card p-3 rounded border border-border">
              <p className="text-sm text-muted-foreground">True Positive Rate</p>
              <p className="text-2xl font-semibold text-primary">78.6%</p>
            </div>
            <div className="bg-card p-3 rounded border border-border">
              <p className="text-sm text-muted-foreground">False Positive Rate</p>
              <p className="text-2xl font-semibold text-destructive">21.4%</p>
            </div>
            <div className="bg-card p-3 rounded border border-border">
              <p className="text-sm text-muted-foreground">Avg. Resolution Time</p>
              <p className="text-2xl font-semibold text-foreground">4.2h</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Tickets Table */}
      <div className="grid-card overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h3 className="text-lg font-medium text-foreground">Recent Tickets</h3>
          <div className="flex items-center gap-2">
            <ExportButton
              title="Recent Kabam Tickets"
              headers={["ID", "Status", "Severity", "Rule", "Unit", "Created"]}
              data={recentTickets.map(ticket => ({
                "ID": formatId(ticket.id, 'TKT'),
                "Status": ticket.status,
                "Severity": ticket.severity,
                "Rule": ticket.rule,
                "Unit": ticket.unit,
                "Created": formatDate(ticket.creationDate)
              }))}
              filename="kabam_recent_tickets"
              variant="outline"
              size="sm"
            />
            <Link href="/kabam-tickets">
              <Button variant="link" className="text-primary">View All</Button>
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-card">
              <TableRow>
                <TableHead className="font-medium text-muted-foreground">ID</TableHead>
                <TableHead className="font-medium text-muted-foreground">Status</TableHead>
                <TableHead className="font-medium text-muted-foreground">Severity</TableHead>
                <TableHead className="font-medium text-muted-foreground">Rule</TableHead>
                <TableHead className="font-medium text-muted-foreground">Unit</TableHead>
                <TableHead className="font-medium text-muted-foreground">Created</TableHead>
                <TableHead className="font-medium text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTickets.map((ticket) => (
                <TableRow key={ticket.id} className="table-row-alt">
                  <TableCell className="font-medium">{formatId(ticket.id, 'TKT')}</TableCell>
                  <TableCell>
                    <StatusBadge status={ticket.status} />
                  </TableCell>
                  <TableCell>
                    <SeverityIndicator severity={ticket.severity} />
                  </TableCell>
                  <TableCell>{ticket.rule}</TableCell>
                  <TableCell>{ticket.unit}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(ticket.creationDate)}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
