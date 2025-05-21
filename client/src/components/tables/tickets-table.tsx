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
  pageSize = 10,
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
                  <SeverityIndicator severity={ticket.importance} />
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
            {page > 1 && (
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => onPageChange(page - 1)}
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}
            
            {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
              let pageNum: number;
              
              // Calculate which page numbers to show (always show 5 or fewer)
              if (totalPages <= 5) {
                pageNum = idx + 1;
              } else if (page <= 3) {
                pageNum = idx + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + idx;
              } else {
                pageNum = page - 2 + idx;
              }
              
              // Show ellipsis for first page
              if (idx === 0 && pageNum > 1) {
                return (
                  <PaginationItem key="start-ellipsis">
                    <PaginationLink 
                      onClick={() => onPageChange(1)}
                      className="cursor-pointer"
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              
              // Show ellipsis for last page
              if (idx === 4 && pageNum < totalPages) {
                return (
                  <PaginationItem key="end-ellipsis">
                    <PaginationLink 
                      onClick={() => onPageChange(totalPages)}
                      className="cursor-pointer"
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    isActive={pageNum === page}
                    onClick={() => onPageChange(pageNum)}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            {page < totalPages && (
              <PaginationItem>
                <PaginationNext 
                  onClick={() => onPageChange(page + 1)}
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
