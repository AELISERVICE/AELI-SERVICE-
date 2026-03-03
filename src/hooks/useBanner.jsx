import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "../api/apiClient";

// Liste complète des bannières (Admin)
export const useGetBanners = () => {
    return useQuery({
        queryKey: ["useGetBanners"],
        queryFn: () => request("/api/admin/banners/admin", "GET"),
        refetchOnWindowFocus: false,
    });
};

// Liste publique des bannières (filtre actives et dates valides)
export const useGetPublicBanners = () => {
    return useQuery({
        queryKey: ["useGetPublicBanners"],
        queryFn: () => request("/api/banners", "GET"),
        refetchOnWindowFocus: false,
    });
};

// Créer une bannière
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

// Modifier une bannière
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

// Supprimer une bannière
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

