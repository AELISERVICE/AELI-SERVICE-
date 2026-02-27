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
export const useGetProviderList = () => {
    return useQuery({
        queryKey: ["useGetProviderList"],
        queryFn: () => request(`/api/providers`, "GET"),
        refetchOnWindowFocus: false,
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