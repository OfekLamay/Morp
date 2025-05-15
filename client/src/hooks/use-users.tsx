import { useQuery, useMutation } from "@tanstack/react-query";
import { User, InsertUser } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useUsers(filters?: Record<string, string>) {
  const { toast } = useToast();
  const endpoint = "/api/users";
  
  // Build query string from filters
  const queryString = filters 
    ? `?${Object.entries(filters)
        .filter(([k, v]) => v !== undefined && v !== "" && !(k === "group" && v === "all"))
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join("&")}`
    : "";
  
  // Get users with optional filtering
  const { data, isLoading, error } = useQuery<{ users: User[], totalCount: number }>({
    queryKey: [endpoint + queryString],
  });

  // Create a new user
  const createUser = useMutation({
    mutationFn: async (newUser: InsertUser) => {
      const res = await apiRequest("POST", endpoint, newUser);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "User created",
        description: "The new user has been successfully created",
      });
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update an existing user
  const updateUser = useMutation({
    mutationFn: async ({ id, ...userData }: Partial<User> & { id: number }) => {
      const res = await apiRequest("PATCH", `${endpoint}/${id}`, userData);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "User updated",
        description: `User ${variables.id} has been successfully updated`,
      });
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete a user
  const deleteUser = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `${endpoint}/${id}`);
      return id;
    },
    onSuccess: (id) => {
      toast({
        title: "User deleted",
        description: `User ${id} has been successfully deleted`,
      });
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete user",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reset user password
  const resetPassword = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `${endpoint}/${id}/reset-password`, {});
      return await res.json();
    },
    onSuccess: (_, id) => {
      toast({
        title: "Password reset",
        description: "User password has been reset",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to reset password",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    users: data?.users || [],
    totalCount: data?.totalCount || 0,
    isLoading,
    error,
    createUser,
    updateUser,
    deleteUser,
    resetPassword
  };
}
