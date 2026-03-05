import { useMutation, useQuery } from "@tanstack/react-query";
import { request } from "../api/apiClient";


// useGetUsers encapsulates data access and state management for its feature domain.
export const useGetUsers = () => {
    return useQuery({
        queryKey: ["useGetUsers"],
        queryFn: () => request("/api/admin/users", "GET"),
        refetchOnWindowFocus: false,
    });
};

// useDeactivateAccount encapsulates data access and state management for its feature domain.
export const useDeactivateAccount = () => {
    return useMutation({
        mutationKey: ["useDeactivateAccount"],
        mutationFn: ({ id, formData }) => request(`/api/admin/users/${id}/status`, "PUT", formData),
    });
};
