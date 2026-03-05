import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "../api/apiClient";


// useProviders encapsulates data access and state management for its feature domain.
export const useProviders = () => {
    return useQuery({
        queryKey: ["useProviders"],
        queryFn: () => request("/api/providers", "GET"),
        refetchOnWindowFocus: false,
    });
};

// useProviderApplications encapsulates data access and state management for its feature domain.
export const useProviderApplications = () => {
    return useQuery({
        queryKey: ["useProviderApplications"],
        queryFn: () => request("/api/admin/provider-applications", "GET"),
        refetchOnWindowFocus: false,
    });
};

// useProviderApplicationsDetail encapsulates data access and state management for its feature domain.
export const useProviderApplicationsDetail = (id) => {
    return useQuery({
        queryKey: ["useProviderApplicationsDetail", id],
        queryFn: () => request(`/api/admin/provider-applications/${id}`, "GET"),
        refetchOnWindowFocus: false,
    });
};

// useProviderPending encapsulates data access and state management for its feature domain.
export const useProviderPending = () => {
    return useQuery({
        queryKey: ["useProviderApplicationsDetail"],
        queryFn: () => request("/api/admin/providers/under-review", "GET"),
        refetchOnWindowFocus: true,
    });
};

// useProvidersCreation encapsulates data access and state management for its feature domain.
export const useProvidersCreation = () => {
    return useMutation({
        mutationKey: ["useProvidersCreation"],
        mutationFn: ({ id, formData }) => request(`/api/admin/provider-applications/${id}/review`, "PUT", formData)
    });
};

// useReviewProviderDocuments encapsulates data access and state management for its feature domain.
export const useReviewProviderDocuments = () => {
    return useMutation({
        mutationKey: ["useReviewProviderDocuments"],
        mutationFn: ({ id, formData }) => request(`/api/admin/providers/${id}/review-documents`, "PUT", formData),
    });
};

// useDeactivateAccountProvider encapsulates data access and state management for its feature domain.
export const useDeactivateAccountProvider = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["useDeactivateAccountProvider"],
        mutationFn: ({ id, formData }) => request(`/api/admin/providers/${id}/status`, "PUT", formData),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["useGetProviderList"] });
            queryClient.invalidateQueries({ queryKey: ["useProviderApplications"] });
        },
    });
};



// useGetProviderList encapsulates data access and state management for its feature domain.
export const useGetProviderList = (params = {}) => {
    const queryString = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null && v !== ""))
    ).toString();

    return useQuery({
        queryKey: ["useGetProviderList", params],
        queryFn: () => request(`/api/admin/providers?${queryString}`, "GET"),
        refetchOnWindowFocus: false,
        enabled: true
    });
};
