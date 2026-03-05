import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "../api/apiClient";


// useGetFeatured encapsulates data access and state management for its feature domain.
export const useGetFeatured = () => {
    return useQuery({
        queryKey: ["useGetFeatured"],
        queryFn: () => request("/api/admin/providers/featured", "GET"),
        refetchOnWindowFocus: false,
    });
};

// useFeature encapsulates data access and state management for its feature domain.
export const useFeature = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["useFeature"],
        mutationFn: ({ id, formData }) => request(`/api/admin/providers/${id}/feature`, "PUT", formData),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["useGetFeatured"] });
        },
    });
};

