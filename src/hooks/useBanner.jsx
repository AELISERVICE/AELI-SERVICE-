import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "../api/apiClient";

// useGetBanners encapsulates data access and state management for its feature domain.
export const useGetBanners = () => {
    return useQuery({
        queryKey: ["useGetBanners"],
        queryFn: () => request("/api/admin/banners/admin", "GET"),
        refetchOnWindowFocus: false,
    });
};

// useGetPublicBanners encapsulates data access and state management for its feature domain.
export const useGetPublicBanners = () => {
    return useQuery({
        queryKey: ["useGetPublicBanners"],
        queryFn: () => request("/api/banners", "GET"),
        refetchOnWindowFocus: false,
    });
};

// useCreateBanner encapsulates data access and state management for its feature domain.
export const useCreateBanner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["useCreateBanner"],
        mutationFn: (formData) => request("/api/admin/banners", "POST", formData),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["useGetBanners"] });
            queryClient.invalidateQueries({ queryKey: ["useGetPublicBanners"] });
        },
    });
};

// useUpdateBanner encapsulates data access and state management for its feature domain.
export const useUpdateBanner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["useUpdateBanner"],
        mutationFn: ({ id, formData }) => request(`/api/admin/banners/${id}`, "PUT", formData),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["useGetBanners"] });
            queryClient.invalidateQueries({ queryKey: ["useGetPublicBanners"] });
        },
    });
};

// useDeleteBanner encapsulates data access and state management for its feature domain.
export const useDeleteBanner = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["useDeleteBanner"],
        mutationFn: ({ id }) => request(`/api/admin/banners/${id}`, "DELETE"),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["useGetBanners"] });
            queryClient.invalidateQueries({ queryKey: ["useGetPublicBanners"] });
        },
    });
};

