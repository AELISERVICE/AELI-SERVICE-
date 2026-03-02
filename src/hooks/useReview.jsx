import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "../api/apiClient";


// get review by provider
export const useGetReviewByProvider = (id) => {
    return useQuery({
        queryKey: ["useGetReviewByProvider", id],
        queryFn: () => request(`/api/reviews/provider/${id}`, "GET"),
        refetchOnWindowFocus: false,
    });
};

// create review
export const useCreateReview = () => {
    return useMutation({
        mutationKey: ["useCreateReview"],
        mutationFn: (formData) => request("/api/reviews", "POST", formData),
    });
};

// udate review
export const useUpdateReview = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["useUpdateReview"],
        mutationFn: ({ id, formData }) => request(`/api/reviews/${id}`, "PUT", formData),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["useGetReviewByProvider"] });
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
            queryClient.invalidateQueries({ queryKey: ["useGetReviewByProvider"] });
        },
    });
};


