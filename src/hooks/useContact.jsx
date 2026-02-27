import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "../api/apiClient";

// create reviews
export const useContact = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["useContact"],
        mutationFn: (formData) => request("/api/contacts", "POST", formData),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["useGetContactSend"] });
        },
    });
};

// stats daily 
export const useGetStatDaily = () => {
    return useQuery({
        queryKey: ["useGetStatDaily"],
        queryFn: () => request(`/api/contacts/stats/daily`, "GET"),
    });
};

// get contact send by user connected
export const useGetContactSend = () => {
    return useQuery({
        queryKey: ["useGetContactSend"],
        queryFn: () => request(`/api/contacts/sent`, "GET"),
    });
};