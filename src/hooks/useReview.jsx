import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "../api/apiClient";


// get reviews
export const useGetReviews = (params = {}) => {
    const queryString = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null && v !== ""))
    ).toString();
    return useQuery({
        queryKey: ["useGetReviews", params],
        queryFn: () => request(`/api/admin/reviews?${queryString}`, "GET"),
        refetchOnWindowFocus: false,
    });
};

// hidde or show review
export const useHideShowReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["useHideShowReview"],
        mutationFn: ({ id, formData }) => request(`/api/admin/reviews/${id}/visibility`, "PUT", formData),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["useGetReviews"] });
        },
    });
};

// delete review
export const useDeleteReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["useDeleteReview"],
        mutationFn: ({ id }) => request(`/api/reviews/${id}`, "DELETE"),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["useGetReviews"] });
        },
    });
};

