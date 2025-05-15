import { useState } from "react";
import { 
  ArrowDown, 
  ArrowUp, 
  BarChart2, 
  Trophy, 
  ListFilter,
  LineChart
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import CustomLineChart from "@/components/charts/line-chart";
import { formatId } from "@/lib/utils";
import { useRulesPerformance } from "@/hooks/use-rules";
import { ExportButton } from "@/components/ui/export-button";

export default function RulesPerformance() {
  const [ruleIds, setRuleIds] = useState<string>("all");
  const [timePeriod, setTimePeriod] = useState("7"); // days
  
  const { performance, isLoading } = useRulesPerformance(
    ruleIds && ruleIds !== "all" ? ruleIds.split(",").map(id => parseInt(id)) : undefined, 
    timePeriod
  );
  
  // Top rules performance data - will be populated from API in real implementation
  const topRules = [
    {
      id: 1,
      description: "Detect suspicious location patterns",
      ticketCount: 150,
      truePositiveRate: 80.0,
      falsePositiveRate: 20.0,
      avgResolutionTime: 4.2,
    },
    {
      id: 2,
      description: "Monitor high-risk communications",
      ticketCount: 80,
      truePositiveRate: 81.3,
      falsePositiveRate: 18.7,
      avgResolutionTime: 3.8,
    },
    {
      id: 3,
      description: "Identify unusual file transfers",
      ticketCount: 42,
      truePositiveRate: 71.4,
      falsePositiveRate: 28.6,
      avgResolutionTime: 2.4,
    }
  ];
  
  // Detection trends data - this would come from the API in a real implementation
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
    { id: "R001-TP", name: "R001 (TP)", color: "hsl(var(--chart-1))" },
    { id: "R001-FP", name: "R001 (FP)", color: "hsl(var(--chart-3))" },
    { id: "R002-TP", name: "R002 (TP)", color: "hsl(var(--chart-2))" },
    { id: "R002-FP", name: "R002 (FP)", color: "hsl(var(--chart-5))" }
  ];
  
  // Monthly comparison data - would come from the API in a real implementation
  const monthlyComparisonData = [
    {
      ruleId: 1,
      prevTickets: 135,
      currTickets: 150,
      prevTruePositiveRate: 76.2,
      currTruePositiveRate: 80.0,
      trend: "improving"
    },
    {
      ruleId: 2,
      prevTickets: 92,
      currTickets: 80,
      prevTruePositiveRate: 78.5,
      currTruePositiveRate: 81.3,
      trend: "improving"
    },
    {
      ruleId: 3,
      prevTickets: 45,
      currTickets: 42,
      prevTruePositiveRate: 66.7,
      currTruePositiveRate: 71.4,
      trend: "improving"
    },
    {
      ruleId: 4,
      prevTickets: 28,
      currTickets: 22,
      prevTruePositiveRate: 82.1,
      currTruePositiveRate: 77.3,
      trend: "declining"
    }
  ];
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold ">Rules Performance</h1>
        <div className="flex space-x-2">
          <Select
            value={ruleIds}
            onValueChange={setRuleIds}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Rules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rules</SelectItem>
              <SelectItem value="1">R001</SelectItem>
              <SelectItem value="2">R002</SelectItem>
              <SelectItem value="3">R003</SelectItem>
              <SelectItem value="4">R004</SelectItem>
              <SelectItem value="1,2">R001, R002</SelectItem>
            </SelectContent>
          </Select>
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

      {/* Top 3 Rules with Most Tickets */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold ">Top 3 Rules with Most Tickets</h2>
        <ExportButton
          title="Top Rules Performance Report"
          headers={["Rule ID", "Description", "Tickets", "TP Rate", "FP Rate"]}
          data={topRules.map(rule => ({
            "Rule ID": formatId(rule.id, 'R', 3),
            "Description": rule.description,
            "Tickets": rule.ticketCount,
            "TP Rate": `${rule.truePositiveRate}%`,
            "FP Rate": `${rule.falsePositiveRate}%`,
          }))}
          filename="top_rules_performance"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Rule #1 */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium ">Highest Ticket Count</h3>
            <span className="text-xs px-2 py-1 bg-primary/20  rounded">
              {formatId(topRules[0].id, 'R', 3)}
            </span>
          </div>
          <p className="text-3xl font-bold ">{topRules[0].ticketCount}</p>
          <p className="text-sm text-muted-foreground">Total tickets generated</p>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>True Positive Rate</span>
              <span className="font-medium ">{topRules[0].truePositiveRate}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${topRules[0].truePositiveRate}%` }}
              />
            </div>
            <div className="flex justify-between text-sm mt-2 mb-1">
              <span>False Positive Rate</span>
              <span className="font-medium text-destructive">{topRules[0].falsePositiveRate}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-destructive" 
                style={{ width: `${topRules[0].falsePositiveRate}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Rule #2 */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium ">Second Highest</h3>
            <span className="text-xs px-2 py-1 bg-secondary/20 rounded">
              {formatId(topRules[1].id, 'R', 3)}
            </span>
          </div>
          <p className="text-3xl font-bold ">{topRules[1].ticketCount}</p>
          <p className="text-sm text-muted-foreground">Total tickets generated</p>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>True Positive Rate</span>
              <span className="font-medium ">{topRules[1].truePositiveRate}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${topRules[1].truePositiveRate}%` }}
              />
            </div>
            <div className="flex justify-between text-sm mt-2 mb-1">
              <span>False Positive Rate</span>
              <span className="font-medium text-destructive">{topRules[1].falsePositiveRate}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-destructive" 
                style={{ width: `${topRules[1].falsePositiveRate}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Rule #3 */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium">Third Highest</h3>
            <span className="text-xs px-2 py-1 bg-amber-500/20 rounded">
              {formatId(topRules[2].id, 'R', 3)}
            </span>
          </div>
          <p className="text-3xl font-bold ">{topRules[2].ticketCount}</p>
          <p className="text-sm text-muted-foreground">Total tickets generated</p>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>True Positive Rate</span>
              <span className="font-medium ">{topRules[2].truePositiveRate}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${topRules[2].truePositiveRate}%` }}
              />
            </div>
            <div className="flex justify-between text-sm mt-2 mb-1">
              <span>False Positive Rate</span>
              <span className="font-medium text-destructive">{topRules[2].falsePositiveRate}%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-destructive" 
                style={{ width: `${topRules[2].falsePositiveRate}%` }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Detection Trends Chart */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold ">Detection Trends</h2>
        <ExportButton
          title="Rule Detection Trends"
          headers={["Date", "R001 (TP)", "R001 (FP)", "R002 (TP)", "R002 (FP)"]}
          data={trendData.map(point => ({
            "Date": point.name,
            "R001 (TP)": point["R001-TP"],
            "R001 (FP)": point["R001-FP"],
            "R002 (TP)": point["R002-TP"],
            "R002 (FP)": point["R002-FP"],
          }))}
          filename="rule_detection_trends"
        />
      </div>
      <CustomLineChart
        data={trendData}
        title=""
        lines={trendLines}
        height={350}
        yAxisLabel="Detections"
        xAxisLabel="Date"
      />

      {/* Rules Performance Cards */}
      <div className="flex justify-between items-center mb-4 mt-8">
        <h2 className="text-xl font-semibold ">Detailed Rule Performance</h2>
        <ExportButton
          title="Detailed Rule Performance"
          headers={["Rule", "Description", "Total Cases", "True Positive Rate", "False Positive Rate", "Avg. Resolution Time"]}
          data={topRules.slice(0, 2).map(rule => ({
            "Rule": formatId(rule.id, 'R', 3),
            "Description": rule.description,
            "Total Cases": rule.ticketCount,
            "True Positive Rate": `${rule.truePositiveRate}%`,
            "False Positive Rate": `${rule.falsePositiveRate}%`,
            "Avg. Resolution Time": `${rule.avgResolutionTime}h`
          }))}
          filename="detailed_rule_performance"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Rule 1 Performance */}
        <Card className="p-5">
          <h3 className="text-lg font-medium  mb-4">
            {formatId(topRules[0].id, 'R', 3)}: {topRules[0].description}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-3 border border-border">
              <p className="text-sm text-muted-foreground">Total Cases</p>
              <p className="text-2xl font-semibold ">{topRules[0].ticketCount}</p>
            </Card>
            <Card className="p-3 border border-border">
              <p className="text-sm text-muted-foreground">True Positive Rate</p>
              <p className="text-2xl font-semibold ">{topRules[0].truePositiveRate}%</p>
            </Card>
            <Card className="p-3 border border-border">
              <p className="text-sm text-muted-foreground">False Positive Rate</p>
              <p className="text-2xl font-semibold text-destructive">{topRules[0].falsePositiveRate}%</p>
            </Card>
            <Card className="p-3 border border-border">
              <p className="text-sm text-muted-foreground">Avg. Resolution Time</p>
              <p className="text-2xl font-semibold ">{topRules[0].avgResolutionTime}h</p>
            </Card>
          </div>
        </Card>

        {/* Rule 2 Performance */}
        <Card className="p-5">
          <h3 className="text-lg font-medium  mb-4">
            {formatId(topRules[1].id, 'R', 3)}: {topRules[1].description}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-3 border border-border">
              <p className="text-sm text-muted-foreground">Total Cases</p>
              <p className="text-2xl font-semibold ">{topRules[1].ticketCount}</p>
            </Card>
            <Card className="p-3 border border-border">
              <p className="text-sm text-muted-foreground">True Positive Rate</p>
              <p className="text-2xl font-semibold ">{topRules[1].truePositiveRate}%</p>
            </Card>
            <Card className="p-3 border border-border">
              <p className="text-sm text-muted-foreground">False Positive Rate</p>
              <p className="text-2xl font-semibold text-destructive">{topRules[1].falsePositiveRate}%</p>
            </Card>
            <Card className="p-3 border border-border">
              <p className="text-sm text-muted-foreground">Avg. Resolution Time</p>
              <p className="text-2xl font-semibold ">{topRules[1].avgResolutionTime}h</p>
            </Card>
          </div>
        </Card>
      </div>

      {/* Monthly Performance Comparison */}
      <div className="flex justify-between items-center mb-4 mt-6">
        <h2 className="text-xl font-semibold ">Monthly Performance Comparison</h2>
        <ExportButton
          title="Rules Monthly Performance Comparison"
          headers={["Rule", "Previous Tickets", "Current Tickets", "Previous TP Rate", "Current TP Rate", "Trend"]}
          data={monthlyComparisonData.map(row => ({
            "Rule": formatId(row.ruleId, 'R', 3),
            "Previous Tickets": row.prevTickets,
            "Current Tickets": row.currTickets,
            "Previous TP Rate": `${row.prevTruePositiveRate}%`,
            "Current TP Rate": `${row.currTruePositiveRate}%`,
            "Trend": row.trend === 'improving' ? 'Improving' : 'Declining'
          }))}
          filename="rules_monthly_comparison"
        />
      </div>

      <Card className="p-5 mb-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium text-muted-foreground">Rule</TableHead>
                <TableHead className="font-medium text-muted-foreground">Tickets (Prev)</TableHead>
                <TableHead className="font-medium text-muted-foreground">Tickets (Curr)</TableHead>
                <TableHead className="font-medium text-muted-foreground">TP% (Prev)</TableHead>
                <TableHead className="font-medium text-muted-foreground">TP% (Curr)</TableHead>
                <TableHead className="font-medium text-muted-foreground">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyComparisonData.map((row) => (
                <TableRow key={row.ruleId} className="table-row-alt">
                  <TableCell className="font-medium">
                    {formatId(row.ruleId, 'R', 3)}
                  </TableCell>
                  <TableCell>{row.prevTickets}</TableCell>
                  <TableCell>{row.currTickets}</TableCell>
                  <TableCell>{row.prevTruePositiveRate}%</TableCell>
                  <TableCell>{row.currTruePositiveRate}%</TableCell>
                  <TableCell>
                    <span className={`flex items-center ${row.trend === 'improving' ? 'text-green-500' : 'text-destructive'}`}>
                      {row.trend === 'improving' ? (
                        <ArrowUp className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDown className="h-4 w-4 mr-1" />
                      )}
                      {row.trend === 'improving' ? 'Improving' : 'Declining'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
