import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import StatusBadge from "@/components/ui/status-badge";
import SeverityIndicator from "@/components/ui/severity-indicator";
import { formatDate, formatId } from "@/lib/utils";
import { Ticket } from "@shared/schema";

interface TicketsTableProps {
  tickets: Ticket[];
  totalCount: number;
  page: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  isMerkaz?: boolean;
}

export default function TicketsTable({
  tickets,
  totalCount,
  page,
  onPageChange,
  pageSize = 21,
  isMerkaz = true
}: TicketsTableProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = ((page - 1) * pageSize) + 1;
  const endItem = Math.min(startItem + pageSize - 1, totalCount);

  return (
    <div className="grid-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-card">
            <TableRow>
              <TableHead className="font-medium text-muted-foreground">ID</TableHead>
              <TableHead className="font-medium text-muted-foreground">Status</TableHead>
              <TableHead className="font-medium text-muted-foreground">User Gathered From</TableHead>
              <TableHead className="font-medium text-muted-foreground">Rule</TableHead>
              <TableHead className="font-medium text-muted-foreground">Severity</TableHead>
              <TableHead className="font-medium text-muted-foreground">
                {isMerkaz ? "Kabam" : "Unit"}
              </TableHead>
              <TableHead className="font-medium text-muted-foreground">Created</TableHead>
              <TableHead className="font-medium text-muted-foreground">Expires</TableHead>
              <TableHead className="font-medium text-muted-foreground">Actions</TableHead>
              <TableHead className="font-medium text-muted-foreground">Image</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id} className="table-row-alt">
                <TableCell className="font-medium">
                  {formatId(ticket.id, 'TKT')}
                </TableCell>
                <TableCell>
                  <StatusBadge status={ticket.status} />
                </TableCell>
                <TableCell>{ticket.userGatheredFrom}</TableCell>
                <TableCell>
                  {ticket.relatedRulesList.map((ruleId) => 
                    formatId(ruleId, 'R', 3)
                  ).join(", ")}
                </TableCell>
                <TableCell>
                  <SeverityIndicator severity={ticket.severity} />
                </TableCell>
                <TableCell>
                  {isMerkaz ? ticket.kabamRelated : ticket.unitRelated}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(ticket.creationDate)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(ticket.expirationDate)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Assign User</DropdownMenuItem>
                      <DropdownMenuItem>Update Status</DropdownMenuItem>
                      <DropdownMenuItem>Mark as {ticket.isTruePositive ? 'False Positive' : 'True Positive'}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                <TableCell>
                  {ticket.imageUrl ? (
                    <img
                      src={ticket.imageUrl}
                      alt="Exception"
                      style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 4 }}
                    />
                  ) : (
                    <span className="text-muted-foreground">No image</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="px-6 py-3 bg-card flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{startItem}</span> to{" "}
            <span className="font-medium">{endItem}</span> of{" "}
            <span className="font-medium">{totalCount}</span> tickets
          </p>
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => onPageChange(Math.max(1, page - 1))} />
            </PaginationItem>
            {[...Array(totalPages)].map((_, idx) => (
              <PaginationItem key={idx}>
                <PaginationLink
                  isActive={page === idx + 1}
                  onClick={() => onPageChange(idx + 1)}
                >
                  {idx + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext onClick={() => onPageChange(Math.min(totalPages, page + 1))} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
