import { useQuery, useMutation } from "@tanstack/react-query";
import { request } from "../api/apiClient";

/**
 * Custom hook that manages apply provider.
 */
export const useApplyProvider = () => {
    return useMutation({
        mutationKey: ["useApplyProvider"],
        mutationFn: (formData) => request("/api/providers/apply", "POST", formData),
    });
};

/**
 * Custom hook that manages get provider list.
 */
export const useGetProviderList = (params = {}) => {

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

/**
 * Custom hook that manages get provider byid.
 */
export const useGetProviderByid = (id) => {
    return useQuery({
        queryKey: ["useGetProviderByid", id],
        queryFn: () => request(`/api/providers/${id}`, "GET"),
        refetchOnWindowFocus: false,
    });
};