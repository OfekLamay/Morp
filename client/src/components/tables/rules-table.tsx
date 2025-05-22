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
import { Rule } from "@shared/schema";

interface RulesTableProps {
  rules: Rule[];
  totalCount: number;
  page: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onViewDetails?: (rule: Rule) => void; // Add this
  onEditRule?: (rule: Rule) => void; // Add this
  onDeleteRule?: (rule: Rule) => void; // Add this
}

export default function RulesTable({
  rules,
  totalCount,
  page,
  onPageChange,
  pageSize = 10,
  onViewDetails,
  onEditRule,
  onDeleteRule
}: RulesTableProps) {
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
              <TableHead className="font-medium text-muted-foreground">Enforcement</TableHead>
              <TableHead className="font-medium text-muted-foreground">Status</TableHead>
              <TableHead className="font-medium text-muted-foreground">Description</TableHead>
              <TableHead className="font-medium text-muted-foreground">Severity</TableHead>
              <TableHead className="font-medium text-muted-foreground">Submitter</TableHead>
              <TableHead className="font-medium text-muted-foreground">Code Reviewer</TableHead>
              <TableHead className="font-medium text-muted-foreground">Created</TableHead>
              <TableHead className="font-medium text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id} className="table-row-alt">
                <TableCell className="font-medium">
                  {formatId(rule.id, 'R', 3)}
                </TableCell>
                <TableCell>
                  <StatusBadge 
                    status={rule.enabled ? rule.enforcement : "Disabled"} 
                    type="enforcement" 
                  />
                </TableCell>
                <TableCell>
                  {rule.enabled ? (
                    <span className="text-green-600 font-semibold">Enabled</span>
                  ) : (
                    <span className="text-red-500 font-semibold">Disabled</span>
                  )}
                </TableCell>
                <TableCell>{rule.description}</TableCell>
                <TableCell>
                  <SeverityIndicator severity={rule.severity} />
                </TableCell>
                <TableCell>{rule.userCreated}</TableCell>
                <TableCell>{rule.managerApproved || 'pending'}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(rule.creationDate)}
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
                      <DropdownMenuItem onClick={() => onViewDetails?.(rule)}>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditRule?.(rule)}>
                        Edit Rule
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDeleteRule?.(rule)}
                      >
                        Delete Rule
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
            <span className="font-medium">{totalCount}</span> rules
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
