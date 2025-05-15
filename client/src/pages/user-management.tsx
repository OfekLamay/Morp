import { useState } from "react";
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import UsersTable from "@/components/tables/users-table";
import { useUsers } from "@/hooks/use-users";

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { users, totalCount, isLoading } = useUsers({
    search: searchTerm,
    group: groupFilter,
    page: page.toString(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold ">User Management</h1>
        <Button className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>

      <div className="grid-card mb-6 p-4">
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3">
          <form onSubmit={handleSearch} className="w-full sm:w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </form>
          
          <Select
            value={groupFilter}
            onValueChange={(value) => {
              setGroupFilter(value);
              setPage(1); // Reset to first page when filter changes
            }}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="All groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All groups</SelectItem>
              <SelectItem value="Kabam">Kabam</SelectItem>
              <SelectItem value="Merkaz Nitur">Merkaz Nitur</SelectItem>
              <SelectItem value="System Administrator">System Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <UsersTable
          users={users}
          totalCount={totalCount}
          page={page}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
