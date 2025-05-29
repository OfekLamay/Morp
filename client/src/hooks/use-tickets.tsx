import { useQuery, useMutation } from "@tanstack/react-query";
import { Ticket, InsertTicket } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useTickets(filters?: Record<string, string | number>, isMerkaz = true) {
  const { toast } = useToast();
  const endpoint = isMerkaz ? "/api/merkaz-tickets" : "/api/kabam-tickets";
  
  // Build query string from filters
  const queryString = filters 
    ? `?${Object.entries(filters)
        .filter(([_, v]) => v !== undefined && v !== "" && v !== "all")
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join("&")}`
    : "";

  // For debugging
  const fetchUrl = endpoint + queryString;
  
  // Get tickets with optional filtering
  const { data, isLoading, error, refetch } = useQuery<{ tickets: Ticket[], totalCount: number }>({
    queryKey: [endpoint + queryString],
  });

  // Create a new ticket
  const createTicket = useMutation({
    mutationFn: async (newTicket: InsertTicket) => {
      const res = await apiRequest("POST", endpoint, newTicket);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Ticket created",
        description: "The new ticket has been successfully created",
      });
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update an existing ticket
  const updateTicket = useMutation({
    mutationFn: async ({ id, ...ticketData }: Partial<Ticket> & { id: number }) => {
      const res = await apiRequest("PATCH", `${endpoint}/${id}`, ticketData);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Ticket updated",
        description: `Ticket ${variables.id} has been successfully updated`,
      });
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete a ticket
  const deleteTicket = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `${endpoint}/${id}`);
      return id;
    },
    onSuccess: (id) => {
      toast({
        title: "Ticket deleted",
        description: `Ticket ${id} has been successfully deleted`,
      });
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete ticket",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    tickets: data?.tickets || [],
    totalCount: data?.totalCount || 0,
    isLoading,
    error,
    createTicket,
    updateTicket,
    deleteTicket,
    refetch,
    fetchUrl,      // <-- add this
    filters,       // <-- add this
  };
}

// Hook for dashboard ticket stats
export function useTicketStats(isMerkaz = true) {
  const endpoint = isMerkaz ? "/api/merkaz-tickets/stats" : "/api/kabam-tickets/stats";
  
  const { data, isLoading, error } = useQuery<{
    totalCount: number;
    highSeverityCount: number;
    inProgressCount: number;
    kabamUserCount?: number;
    unitCount?: number;
    statusDistribution: Record<string, number>;
  }>({
    queryKey: [endpoint],
  });

  return {
    stats: data,
    isLoading,
    error
  };
}
