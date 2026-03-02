import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "../api/apiClient";


// get featured
export const useGetFeatured = () => {
    return useQuery({
        queryKey: ["useGetFeatured"],
        queryFn: () => request("/api/admin/providers/featured", "GET"),
        refetchOnWindowFocus: false,
    });
};

// put feature provider
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

