import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TicketsTable from "@/components/tables/tickets-table";
import { useTickets } from "@/hooks/use-tickets";

export default function KabamTickets() {
  const [filters, setFilters] = useState({
    status: "all",
    unit: "all",
    rule: "all",
    severity: "all",
  });
  
  const [page, setPage] = useState(1);
  const { tickets, totalCount, isLoading } = useTickets({ ...filters, page }, false);
  
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset page when filter changes
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Kabam Tickets</h1>
      </div>

      <div className="grid-card mb-6 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select 
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="false positive">False Positive</SelectItem>
              <SelectItem value="waiting for identification">Waiting for Identification</SelectItem>
              <SelectItem value="not related yet">Not Related Yet</SelectItem>
              <SelectItem value="reopened">Reopened</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filters.unit}
            onValueChange={(value) => handleFilterChange("unit", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All units" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All units</SelectItem>
              <SelectItem value="Unit 1">Unit 1</SelectItem>
              <SelectItem value="Unit 2">Unit 2</SelectItem>
              <SelectItem value="Unit 3">Unit 3</SelectItem>
              <SelectItem value="Unit 4">Unit 4</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filters.rule}
            onValueChange={(value) => handleFilterChange("rule", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All rules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All rules</SelectItem>
              <SelectItem value="1">R001</SelectItem>
              <SelectItem value="2">R002</SelectItem>
              <SelectItem value="3">R003</SelectItem>
              <SelectItem value="4">R004</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={filters.severity}
            onValueChange={(value) => handleFilterChange("severity", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severities</SelectItem>
              <SelectItem value="high">High (8-10)</SelectItem>
              <SelectItem value="medium">Medium (5-7)</SelectItem>
              <SelectItem value="low">Low (1-4)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <TicketsTable
          tickets={tickets}
          totalCount={totalCount}
          page={page}
          onPageChange={setPage}
          isMerkaz={false}
        />
      )}
    </div>
  );
}
