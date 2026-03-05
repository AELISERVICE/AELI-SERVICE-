import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "../api/apiClient";


// useGetReviews encapsulates data access and state management for its feature domain.
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

// useHideShowReview encapsulates data access and state management for its feature domain.
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

// useDeleteReview encapsulates data access and state management for its feature domain.
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

