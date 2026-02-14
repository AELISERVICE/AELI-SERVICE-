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

// Statistiques d'utilisation de l'API
export const useAnalyticsStatistiquesAPI = () => {
    return useQuery({
        queryKey: ["useAnalyticsStatistiquesAPI"],
        queryFn: () => request("/api/admin/analytics-StatistiquesAPI", "GET"),
        refetchOnWindowFocus: false,
    });
};