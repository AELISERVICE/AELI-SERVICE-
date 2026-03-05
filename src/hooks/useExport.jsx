import { useMutation } from "@tanstack/react-query";
import { request } from "../api/apiClient";


// useExportUsers encapsulates data access and state management for its feature domain.
export const useExportUsers = () => {
    return useMutation({
        mutationKey: ["useExportUsers"],
        mutationFn: () => request("/api/admin/export/users", "GET"),
    });
};

// useExportProviders encapsulates data access and state management for its feature domain.
export const useExportProviders = () => {
    return useMutation({
        mutationKey: ["useExportProviders"],
        mutationFn: () => request("/api/admin/export/providers", "GET"),
    });
};

// useExportReviews encapsulates data access and state management for its feature domain.
export const useExportReviews = () => {
    return useMutation({
        mutationKey: ["useExportReviews"],
        mutationFn: () => request("/api/admin/export/reviews", "GET"),
    });
};

// useExportContacts encapsulates data access and state management for its feature domain.
export const useExportContacts = () => {
    return useMutation({
        mutationKey: ["useExportContacts"],
        mutationFn: () => request("/api/admin/export/contacts", "GET"),
    });
};

// useExportGlobalReport encapsulates data access and state management for its feature domain.
export const useExportGlobalReport = () => {
    return useMutation({
        mutationKey: ["useExportGlobalReport"],
        mutationFn: () => request("/api/admin/export/report", "GET"),
    });
};
