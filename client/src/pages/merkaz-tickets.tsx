import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/ui/status-badge";
import SeverityIndicator from "@/components/ui/severity-indicator";
import { useTickets } from "@/hooks/use-tickets";

export default function MerkazTickets() {
  const [filters, setFilters] = useState({
    status: "all",
    kabam: "all",
    rule: "all",
    severity: "all",
  });

  const [page, setPage] = useState(1);
  const { tickets, totalCount, isLoading } = useTickets({ ...filters, page }, true);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset page when filter changes
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold ">Merkaz Tickets</h1>
      </div>

      {/* Filters */}
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
            value={filters.kabam}
            onValueChange={(value) => handleFilterChange("kabam", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All kabams" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All kabams</SelectItem>
              <SelectItem value="Kabam A">Kabam A</SelectItem>
              <SelectItem value="Kabam B">Kabam B</SelectItem>
              <SelectItem value="Kabam C">Kabam C</SelectItem>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-white rounded-lg shadow p-4 flex flex-col">
              <div className="flex justify-between mb-2">
                <StatusBadge status={ticket.status} />
                <SeverityIndicator severity={ticket.severity} />
              </div>
              {ticket.imageUrl && (
                <img
                  src={ticket.imageUrl}
                  alt="Exception"
                  className="w-full h-48 object-cover rounded mb-4"
                />
              )}
              <div className="flex flex-col gap-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">User:</span>
                  <span>{ticket.userGatheredFrom}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Kabam:</span>
                  <span>{ticket.kabamRelated}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Rule:</span>
                  <span>{ticket.relatedRulesList[0] ?? "Didn't catch rule/s"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Created:</span>
                  <span>{ticket.creationDate ? new Date(ticket.creationDate).toLocaleString() : ""}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
