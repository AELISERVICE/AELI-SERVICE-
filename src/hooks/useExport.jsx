import { useMutation } from "@tanstack/react-query";
import { request } from "../api/apiClient";


// Export Utilisateurs CSV
export const useExportUsers = () => {
    return useMutation({
        mutationKey: ["useExportUsers"],
        mutationFn: () => request("/api/admin/export/users", "GET"),
    });
};

// Export Prestataires CSV
export const useExportProviders = () => {
    return useMutation({
        mutationKey: ["useExportProviders"],
        mutationFn: () => request("/api/admin/export/providers", "GET"),
    });
};

// Export Avis CSV
export const useExportReviews = () => {
    return useMutation({
        mutationKey: ["useExportReviews"],
        mutationFn: () => request("/api/admin/export/reviews", "GET"),
    });
};

// Export Contacts CSV
export const useExportContacts = () => {
    return useMutation({
        mutationKey: ["useExportContacts"],
        mutationFn: () => request("/api/admin/export/contacts", "GET"),
    });
};

// Rapport PDF Global
export const useExportGlobalReport = () => {
    return useMutation({
        mutationKey: ["useExportGlobalReport"],
        mutationFn: () => request("/api/admin/export/report", "GET"),
    });
};