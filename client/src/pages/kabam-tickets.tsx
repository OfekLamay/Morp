import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/ui/status-badge";
import SeverityIndicator from "@/components/ui/severity-indicator";
import { useTickets } from "@/hooks/use-tickets";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

const TICKET_STATUSES = [
  "done",
  "in progress",
  "false positive",
  "waiting for identification",
  "not related yet",
  "reopened"
];

export default function KabamTickets() {
  const [filters, setFilters] = useState({
    status: "all",
    unit: "all",
    rule: "all",
    severity: "all",
  });

  const [page, setPage] = useState(1);
  const { tickets, totalCount, isLoading, updateTicket, refetch } = useTickets({ ...filters, page }, false);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset page when filter changes
  };

  function handleUpdateStatus(ticketId: number, newStatus: string) {
    updateTicket.mutate(
      { id: ticketId, status: newStatus },
      {
        onSuccess: () => {
          if (typeof refetch === "function") refetch();
        }
      }
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold ">Kabam Tickets</h1>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map(ticket => (
            <div key={ticket.id} className="bg-white rounded-lg shadow p-4 flex flex-col">
              <div className="flex justify-between mb-2">
                <StatusBadge status={ticket.status} />
                <SeverityIndicator severity={ticket.severity} />
              </div>
              <div className="flex justify-end mb-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-5 w-5" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {/* TODO: View Details */}}>View Details</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {/* TODO: Assign User */}}>Assign User</DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      Update Status
                    </DropdownMenuItem>
                    {TICKET_STATUSES.map(status => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => handleUpdateStatus(ticket.id, status)}
                        inset
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem
                      onClick={() =>
                        updateTicket.mutate(
                          { id: ticket.id, isTruePositive: true, status: "not related yet" },
                          { onSuccess: () => { if (typeof refetch === "function") refetch(); } }
                        )
                      }
                    >
                      Mark as True Positive
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        updateTicket.mutate(
                          { id: ticket.id, isTruePositive: false, status: "false positive" },
                          { onSuccess: () => { if (typeof refetch === "function") refetch(); } }
                        )
                      }
                    >
                      Mark as False Positive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {ticket.imageUrl && (
                <img
                  src={ticket.imageUrl}
                  alt="Exception"
                  className="w-full h-48 object-cover rounded mb-4"
                />
              )}
              {/* Ticket details */}
              <div className="flex flex-col gap-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">User monitored:</span>
                  <span>{ticket.userGatheredFrom}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Unit related:</span>
                  <span>{ticket.unitRelated}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Rule related:</span>
                  <span>{ticket.relatedRulesList?.[0] ?? "Didn't catch rule/s"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Date created:</span>
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
