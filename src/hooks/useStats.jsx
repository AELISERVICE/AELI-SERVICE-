import { useMutation, useQuery } from "@tanstack/react-query";
import { request } from "../api/apiClient";


// useStats encapsulates data access and state management for its feature domain.
export const useStats = () => {
    return useQuery({
        queryKey: ["useStats"],
        queryFn: () => request("/api/admin/stats", "GET"),
        refetchOnWindowFocus: false,
    });
};

// useSecurityStats encapsulates data access and state management for its feature domain.
export const useSecurityStats = () => {
    return useQuery({
        queryKey: ["useSecurityStats"],
        queryFn: () => request("/api/admin/security-stats", "GET"),
        refetchOnWindowFocus: false,
    });
};

// useSecurityLogs encapsulates data access and state management for its feature domain.
export const useSecurityLogs = () => {
    return useQuery({
        queryKey: ["useSecurityLogs"],
        queryFn: () => request("/api/admin/security-logs", "GET"),
        refetchOnWindowFocus: false,
    });
};

// usebannedIps encapsulates data access and state management for its feature domain.
export const usebannedIps = () => {
    return useQuery({
        queryKey: ["usebannedIps"],
        queryFn: () => request("/api/admin/banned-ips", "GET"),
        refetchOnWindowFocus: false,
    });
};

// useUnbanIP encapsulates data access and state management for its feature domain.
export const useUnbanIP = () => {
    return useMutation({
        mutationKey: ["useUnbanIP"],
        mutationFn: (ip) => request(`/api/admin/banned-ips/${ip}`, "DELETE")
    });
};

// useAnalyticsStatistiquesAPI encapsulates data access and state management for its feature domain.
export const useAnalyticsStatistiquesAPI = () => {
    return useQuery({
        queryKey: ["useAnalyticsStatistiquesAPI"],
        queryFn: () => request("/api/admin/analytics-StatistiquesAPI", "GET"),
        refetchOnWindowFocus: false,
    });
};
