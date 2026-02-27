import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "../api/apiClient";


// create categories
export const useCreateCategories = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["useCreateCategories"],
        mutationFn: (formData) => request("/api/services/categories", "POST", formData),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["useGetCategory"] });
        },
    });
};

// get category
export const useGetCategory = () => {
    return useQuery({
        queryKey: ["useGetCategory"],
        queryFn: () => request(`/api/services/categories`, "GET"),
        refetchOnWindowFocus: false,
    });
};

// get services by provider
export const useGetServicesByProvider = (id) => {
    return useQuery({
        queryKey: ["useGetServicesByProvider", id],
        queryFn: () => request(`/api/services/provider/${id}`, "GET"),
        refetchOnWindowFocus: false,
    });
};

// create services
export const useCreateServices = () => {
    return useMutation({
        mutationKey: ["useCreateServices"],
        mutationFn: (formData) => request("/api/services", "POST", formData),
    });
};

// update services
export const useUpdateServices = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["useUpdateServices"],
        mutationFn: ({ id, formData }) => request(`/api/services/${id}`, "PUT", formData),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["useGetServicesByProvider"] });
        },
    });
};

// delete services
export const useDeleteServices = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["useDeleteServices"],
        mutationFn: ({ id }) => request(`/api/services/${id}`, "DELETE"),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["useGetServicesByProvider"] });
        },
    });
};