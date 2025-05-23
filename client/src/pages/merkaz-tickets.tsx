import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatusBadge from "@/components/ui/status-badge";
import SeverityIndicator from "@/components/ui/severity-indicator";
import { useTickets } from "@/hooks/use-tickets";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Dialog } from "@/components/ui/dialog"; // Replace with your dialog/modal import if you have one

const emptyImg = "/media/wow-such-empty.jpg";

function useAllUsers() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(data => setUsers(data.users || []));
  }, []);
  return users;
}

const TICKET_STATUSES = [
  "done",
  "in progress",
  "false positive",
  "waiting for identification",
  "not related yet",
  "reopened"
];

// If ticket.imageUrl is a full URL, use as is.
// If it's a local filename, prepend the public path.
function getImageSrc(imageUrl: string | undefined) {
  if (!imageUrl) return emptyImg;
  if (/^https?:\/\//.test(imageUrl)) return imageUrl;
  if (imageUrl.startsWith("/media/extractedimages/")) return imageUrl;
  // Remove any leading slash and prepend the correct folder
  const cleanName = imageUrl.replace(/^\/+/, "");
  return `/media/extractedimages/${cleanName}`;
}

export default function MerkazTickets() {
  const [filters, setFilters] = useState({
    status: "all",
    kabam: "all",
    rule: "all",
    severity: "all",
  });

  const [page, setPage] = useState(1);
  const { tickets, totalCount, isLoading, updateTicket, refetch } = useTickets({ ...filters, page }, true);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTicket, setAssignTicket] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const allUsers = useAllUsers();

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

  function handleViewDetails(ticket) {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  }

  const kabamOptions = Array.from(
    new Set(tickets.map(ticket => ticket.kabamRelated).filter(Boolean))
  );

  const ruleOptions = Array.from(
    new Set(
      tickets
        .flatMap(ticket => ticket.relatedRulesList || [])
        .filter(Boolean)
    )
  ).sort((a, b) => a - b); // Sort numerically if rules are numbers

  useEffect(() => {
    if (typeof refetch === "function") {
      refetch();
    }
    // Optionally, add dependencies if you want to refetch on filter change, etc.
  }, []); // Empty array = only on mount

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
              {kabamOptions.map(kabam => (
                <SelectItem key={kabam} value={kabam}>{kabam}</SelectItem>
              ))}
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
              {ruleOptions.map(rule => (
                <SelectItem key={rule} value={String(rule)}>
                  {`R${String(rule).padStart(3, "0")}`}
                </SelectItem>
              ))}
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
              <div className="flex items-center justify-between mb-2">
                {/* Left: Status above Severity */}
                <div className="flex flex-col gap-1">
                  <StatusBadge status={ticket.status} />
                  <SeverityIndicator severity={ticket.severity} />
                </div>
                {/* Right: Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-5 w-5" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewDetails(ticket)}>
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setAssignTicket(ticket);
                        setAssignModalOpen(true);
                        setSelectedUsers(ticket.usersRelatedTo || []);
                      }}
                    >
                      Assign User
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        Update Status
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {TICKET_STATUSES.map(status => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => handleUpdateStatus(ticket.id, status)}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
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
                <a
                  href={getImageSrc(ticket.imageUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={-1} // Prevents tab focus on the link if you want only the image focusable
                >
                  <img
                    src={getImageSrc(ticket.imageUrl)}
                    alt=""
                    className="w-full h-48 object-cover rounded mb-4 cursor-pointer"
                    onError={e => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = emptyImg;
                    }}
                  />
                </a>
              )}
              {/* Ticket */}
              <div className="flex flex-col gap-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">User monitored:</span>
                  <span>{ticket.userGatheredFrom}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Kabam related:</span>
                  <span>{ticket.kabamRelated}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Rule related:</span>
                  <span>{ticket.relatedRulesList[0] ?? "Didn't catch rule/s"}</span>
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
      {isModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4">Ticket Details</h2>
            <img
              src={getImageSrc(selectedTicket.imageUrl)}
              alt=""
              className="w-full h-48 object-cover rounded mb-4"
              onError={e => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = emptyImg;
              }}
            />
            <div className="space-y-2 text-sm">
              <div><span className="font-semibold">ID:</span> {selectedTicket.id}</div>
              <div><span className="font-semibold">Creation Date:</span> {selectedTicket.creationDate ? new Date(selectedTicket.creationDate).toLocaleString() : ""}</div>
              <div><span className="font-semibold">Expiration Date:</span> {selectedTicket.expirationDate ? new Date(selectedTicket.expirationDate).toLocaleString() : ""}</div>
              <div><span className="font-semibold">User Gathered From:</span> {selectedTicket.userGatheredFrom}</div>
              <div><span className="font-semibold">User Managing:</span> {selectedTicket.userManaging}</div>
              <div><span className="font-semibold">Related Rules:</span> {selectedTicket.relatedRulesList?.join(", ")}</div>
              <div><span className="font-semibold">Severity:</span> {selectedTicket.severity}</div>
              <div><span className="font-semibold">Users Related To:</span> {selectedTicket.usersRelatedTo?.join(", ")}</div>
              <div><span className="font-semibold">Status:</span> {selectedTicket.status}</div>
              <div><span className="font-semibold">True Positive:</span> {selectedTicket.isTruePositive ? "Yes" : "No"}</div>
              <div><span className="font-semibold">Kabam Related:</span> {selectedTicket.kabamRelated}</div>
              <div><span className="font-semibold">Unit Related:</span> {selectedTicket.unitRelated}</div>
            </div>
          </div>
        </div>
      )}
      {assignModalOpen && assignTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={() => setAssignModalOpen(false)}
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">Who would you like to assign it to?</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allUsers
                .filter(u => u.username !== assignTicket.userGatheredFrom) // Exclude monitored user
                .map(user => (
                  <label key={user.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.username)}
                      onChange={e => {
                        setSelectedUsers(sel =>
                          e.target.checked
                            ? [...sel, user.username]
                            : sel.filter(u => u !== user.username)
                        );
                      }}
                    />
                    <span>{user.username} ({user.role})</span>
                  </label>
                ))}
            </div>
            <button
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
              onClick={() => {
                updateTicket.mutate(
                  { id: assignTicket.id, usersRelatedTo: selectedUsers },
                  {
                    onSuccess: () => {
                      setAssignModalOpen(false);
                      if (typeof refetch === "function") refetch();
                    }
                  }
                );
              }}
            >
              Assign
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
