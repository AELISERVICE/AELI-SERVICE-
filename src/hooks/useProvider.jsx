import { useMutation, useQuery } from "@tanstack/react-query";
import { request } from "../api/apiClient";


// Liste des prestataires
export const useProviders = () => {
    return useQuery({
        queryKey: ["useProviders"],
        queryFn: () => request("/api/providers", "GET"),
        refetchOnWindowFocus: false,
    });
};

// Liste des candidatures
export const useProviderApplications = () => {
    return useQuery({
        queryKey: ["useProviderApplications"],
        queryFn: () => request("/api/admin/provider-applications", "GET"),
        refetchOnWindowFocus: false,
    });
};

// Détail d'une candidature
export const useProviderApplicationsDetail = (id) => {
    return useQuery({
        queryKey: ["useProviderApplicationsDetail", id],
        queryFn: () => request(`/api/admin/provider-applications/${id}`, "GET"),
        refetchOnWindowFocus: false,
    });
};

// Prestataires non vérifiés
export const useProviderPending = () => {
    return useQuery({
        queryKey: ["useProviderApplicationsDetail"],
        queryFn: () => request("/api/admin/providers/under-review", "GET"),
        refetchOnWindowFocus: true,
    });
};

// Valider/Rejeter un prestataire
export const useProvidersCreation = () => {
    return useMutation({
        mutationKey: ["useProvidersCreation"],
        mutationFn: ({ id, formData }) => request(`/api/admin/provider-applications/${id}/review`, "PUT", formData)
    });
};

// Verifier documents provider
export const useReviewProviderDocuments = () => {
    return useMutation({
        mutationKey: ["useReviewProviderDocuments"],
        mutationFn: ({ id, formData }) => request(`/api/admin/providers/${id}/review-documents`, "PUT", formData),
    });
};

// Désactiver un compte providers
export const useDeactivateAccountProvider = () => {
    return useMutation({
        mutationKey: ["useDeactivateAccountProvider"],
        mutationFn: ({ id, formData }) => request(`/api/admin/providers/${id}/status`, "PUT", formData),
    });
};
