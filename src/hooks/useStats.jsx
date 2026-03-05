import { useMutation, useQuery } from "@tanstack/react-query";
import { request } from "../api/apiClient";

/**
 * Custom hook that manages the stats workflow.
 */
export const useStats = () => {
  return useQuery({
    queryKey: ["useStats"],
    queryFn: () => request("/api/admin/stats", "GET"),
    refetchOnWindowFocus: false,
  });
};

/**
 * Custom hook that manages the security stats workflow.
 */
export const useSecurityStats = () => {
  return useQuery({
    queryKey: ["useSecurityStats"],
    queryFn: () => request("/api/admin/security-stats", "GET"),
    refetchOnWindowFocus: false,
  });
};

/**
 * Custom hook that manages the security logs workflow.
 */
export const useSecurityLogs = () => {
  return useQuery({
    queryKey: ["useSecurityLogs"],
    queryFn: () => request("/api/admin/security-logs", "GET"),
    refetchOnWindowFocus: false,
  });
};

/**
 * Custom hook that manages the banned ips workflow.
 */
export const usebannedIps = () => {
  return useQuery({
    queryKey: ["usebannedIps"],
    queryFn: () => request("/api/admin/banned-ips", "GET"),
    refetchOnWindowFocus: false,
  });
};

/**
 * Custom hook that manages the unban i p workflow.
 */
export const useUnbanIP = () => {
  return useMutation({
    mutationKey: ["useUnbanIP"],
    mutationFn: (ip) => request(`/api/admin/banned-ips/${ip}`, "DELETE"),
  });
};

/**
 * Custom hook that manages the analytics statistiques a p i workflow.
 */
export const useAnalyticsStatistiquesAPI = () => {
  return useQuery({
    queryKey: ["useAnalyticsStatistiquesAPI"],
    queryFn: () => request("/api/admin/analytics-StatistiquesAPI", "GET"),
    refetchOnWindowFocus: false,
  });
};
