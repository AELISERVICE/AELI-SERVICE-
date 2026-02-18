import { useMutation, useQuery } from "@tanstack/react-query";
import { request } from "../api/apiClient";


// Statistiques globales
export const useStats = () => {
    return useQuery({
        queryKey: ["useStats"],
        queryFn: () => request("/api/admin/stats", "GET"),
        // Optionnel : ne pas rafraîchir à chaque clic sur la fenêtre
        refetchOnWindowFocus: false,
    });
};

// Statistiques de sécurité
export const useSecurityStats = () => {
    return useQuery({
        queryKey: ["useSecurityStats"],
        queryFn: () => request("/api/admin/security-stats", "GET"),
        refetchOnWindowFocus: false,
    });
};

// Logs de sécurité récents
export const useSecurityLogs = () => {
    return useQuery({
        queryKey: ["useSecurityLogs"],
        queryFn: () => request("/api/admin/security-logs", "GET"),
        refetchOnWindowFocus: false,
    });
};

// Liste des IP bannies
export const usebannedIps = () => {
    return useQuery({
        queryKey: ["usebannedIps"],
        queryFn: () => request("/api/admin/banned-ips", "GET"),
        refetchOnWindowFocus: false,
    });
};

// Débloquer une IP bannie
export const useUnbanIP = () => {
    return useMutation({
        mutationKey: ["useUnbanIP"],
        mutationFn: (ip) => request(`/api/admin/banned-ips/${ip}`, "DELETE")
    });
};

// Statistiques d'utilisation de l'API
export const useAnalyticsStatistiquesAPI = () => {
    return useQuery({
        queryKey: ["useAnalyticsStatistiquesAPI"],
        queryFn: () => request("/api/admin/analytics-StatistiquesAPI", "GET"),
        refetchOnWindowFocus: false,
    });
};