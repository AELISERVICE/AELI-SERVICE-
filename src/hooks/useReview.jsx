import { useQuery, useMutation } from "@tanstack/react-query";
import { request } from "../api/apiClient";

// create reviews
export const useCreateReview = () => {
    return useMutation({
        mutationKey: ["useCreateReview"],
        mutationFn: (formData) => request("/api/reviews", "POST", formData),
    });
};