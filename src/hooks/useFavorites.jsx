import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "../api/apiClient";


// get favorites
export const useGetFavorites = () => {
    return useQuery({
        queryKey: ["useGetFavorites"],
        queryFn: () => request(`/api/favorites`, "GET"),
    });
};

// check favorites from user
export const useCheckFavorites = (id) => {
    return useQuery({
        queryKey: ["useCheckFavorites", id],
        queryFn: () => request(`/api/favorites/check/${id}`, "GET"),
    });
};

// add to favorites
export const useAddToFavorites = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["useAddToFavorites"],
        mutationFn: (formData) => request("/api/favorites", "POST", formData),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["useGetFavorites"] });
            queryClient.invalidateQueries({ queryKey: ["useGetProviderList"] });
            if (variables?.providerId) {
                queryClient.invalidateQueries({
                    queryKey: ["useCheckFavorites", variables.providerId]
                });
            }
        },
    });
};

//  delete favorites
export const useDeleteFavorites = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["useDeleteFavorites"],
        mutationFn: ({ id }) => request(`/api/favorites/${id}`, "DELETE"),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["useGetFavorites"] });
            queryClient.invalidateQueries({ queryKey: ["useGetProviderList"] });
            // On force le "CHECK" à se rafraîchir pour ce prestataire précis
            if (variables?.id) {
                queryClient.invalidateQueries({
                    queryKey: ["useCheckFavorites", variables.id]
                });
            }
        },
    });
};