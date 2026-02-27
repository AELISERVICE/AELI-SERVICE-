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

// get contact recived by provider
export const useGetReceivedContact = () => {
    return useQuery({
        queryKey: ["useGetReceivedContact"],
        queryFn: () => request(`/api/contacts/received`, "GET"),
    });
};


export const useUpdateStatusMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["useUpdateStatusMessage"],
        mutationFn: ({ id, formData }) => request(`/api/contacts/${id}/status`, "PUT", formData),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["useGetReceivedContact"] });
        },
    });
};


export const useUnlockMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["useUnlockMessage"],
        mutationFn: ({ id, formData }) => request(`/api/contacts/${id}/unlock`, "POST", formData),
    });
};
