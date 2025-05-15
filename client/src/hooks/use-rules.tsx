import { useQuery, useMutation } from "@tanstack/react-query";
import { Rule, InsertRule } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useRules(filters?: Record<string, string | number>) {
  const { toast } = useToast();
  const endpoint = "/api/rules";
  
  // Build query string from filters
  const queryString = filters 
    ? `?${Object.entries(filters)
        .filter(([k, v]) => v !== undefined && v !== "" && !(k === "enforcement" && v === "all") && !(k === "severity" && v === "all"))
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join("&")}`
    : "";
  
  // Get rules with optional filtering
  const { data, isLoading, error } = useQuery<{ rules: Rule[], totalCount: number }>({
    queryKey: [endpoint + queryString],
  });

  // Create a new rule
  const createRule = useMutation({
    mutationFn: async (newRule: InsertRule) => {
      const res = await apiRequest("POST", endpoint, newRule);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Rule created",
        description: "The new rule has been successfully created",
      });
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    onError: (error) => {
      toast({
        title: "Failed to create rule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update an existing rule
  const updateRule = useMutation({
    mutationFn: async ({ id, ...ruleData }: Partial<Rule> & { id: number }) => {
      const res = await apiRequest("PATCH", `${endpoint}/${id}`, ruleData);
      return await res.json();
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Rule updated",
        description: `Rule ${variables.id} has been successfully updated`,
      });
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update rule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete a rule
  const deleteRule = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `${endpoint}/${id}`);
      return id;
    },
    onSuccess: (id) => {
      toast({
        title: "Rule deleted",
        description: `Rule ${id} has been successfully deleted`,
      });
      queryClient.invalidateQueries({ queryKey: [endpoint] });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete rule",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    rules: data?.rules || [],
    totalCount: data?.totalCount || 0,
    isLoading,
    error,
    createRule,
    updateRule,
    deleteRule
  };
}

// Hook for rule performance data
export function useRulesPerformance(ruleIds?: number[], timePeriod?: string) {
  const endpoint = "/api/rules/performance";
  
  // Build query string
  const params = new URLSearchParams();
  if (ruleIds && ruleIds.length > 0) {
    params.append("ruleIds", ruleIds.join(","));
  }
  if (timePeriod) {
    params.append("period", timePeriod);
  }
  
  const queryString = params.toString() ? `?${params.toString()}` : "";
  
  const { data, isLoading, error } = useQuery<{
    topRules: {
      id: number;
      description: string;
      ticketCount: number;
      truePositiveRate: number;
      falsePositiveRate: number;
      avgResolutionTime: number;
    }[];
    performanceOverTime: {
      date: string;
      ruleData: {
        ruleId: number;
        truePositives: number;
        falsePositives: number;
      }[];
    }[];
    monthlyComparison: {
      ruleId: number;
      prevTickets: number;
      currTickets: number;
      prevTruePositiveRate: number;
      currTruePositiveRate: number;
      trend: "improving" | "declining" | "stable";
    }[];
  }>({
    queryKey: [endpoint + queryString],
  });
  
  return {
    performance: data,
    isLoading,
    error
  };
}
