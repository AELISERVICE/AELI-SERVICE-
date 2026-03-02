import { useQuery, useMutation } from "@tanstack/react-query";
import { request } from "../api/apiClient";

// apply
export const useApplyProvider = () => {
    return useMutation({
        mutationKey: ["useApplyProvider"],
        mutationFn: (formData) => request("/api/providers/apply", "POST", formData),
    });
};

// get providers list
export const useGetProviderList = (params = {}) => {
    // On transforme l'objet { search: '...', maxPrice: 500 } en string query
    const queryString = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null && v !== ""))
    ).toString();

    return useQuery({
        queryKey: ["useGetProviderList", params], // La clé change quand les filtres changent
        queryFn: () => request(`/api/providers?${queryString}`, "GET"),
        refetchOnWindowFocus: false,
        enabled: true
    });
};

// get provider by id
export const useGetProviderByid = (id) => {
    return useQuery({
        queryKey: ["useGetProviderByid", id],
        queryFn: () => request(`/api/providers/${id}`, "GET"),
        refetchOnWindowFocus: false,
    });
};