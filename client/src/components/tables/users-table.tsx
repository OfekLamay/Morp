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
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { User } from "@shared/schema";

interface UsersTableProps {
  users: User[];
  totalCount: number;
  page: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
}

export default function UsersTable({
  users,
  totalCount,
  page,
  onPageChange,
  pageSize = 20
}: UsersTableProps) {
  const totalPages = Math.ceil(totalCount / pageSize);
  const startItem = ((page - 1) * pageSize) + 1;
  const endItem = Math.min(startItem + pageSize - 1, totalCount);

  function getPermissionBadgeStyle(permissionGroup: string) {
    switch (permissionGroup) {
      case 'System Administrator':
        return 'bg-primary/20 text-primary';
      case 'Merkaz Nitur':
        return 'bg-purple-500/20 text-purple-500';
      case 'Kabam':
        return 'bg-secondary/20 text-secondary';
      default:
        return 'bg-gray-500/20 text-gray-500';
    }
  }

  return (
    <div className="grid-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-card">
            <TableRow>
              <TableHead className="font-medium text-muted-foreground">Full Name</TableHead>
              <TableHead className="font-medium text-muted-foreground">Username</TableHead>
              <TableHead className="font-medium text-muted-foreground">Email</TableHead>
              <TableHead className="font-medium text-muted-foreground">Permission Group</TableHead>
              <TableHead className="font-medium text-muted-foreground">Assigned Kabam</TableHead>
              <TableHead className="font-medium text-muted-foreground">Last Login</TableHead>
              <TableHead className="font-medium text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="table-row-alt">
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`border-none font-medium ${getPermissionBadgeStyle(user.permissionGroup)}`}
                  >
                    {user.permissionGroup}
                  </Badge>
                </TableCell>
                <TableCell>{user.kabam || '--'}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(user.lastLogin)}
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
                      <DropdownMenuItem>Edit User</DropdownMenuItem>
                      <DropdownMenuItem>Reset Password</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete User</DropdownMenuItem>
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
            <span className="font-medium">{totalCount}</span> users
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
