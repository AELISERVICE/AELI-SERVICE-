import { useMutation, useQuery } from "@tanstack/react-query";
import { request } from "../api/apiClient";


// Recupere tous les  utilisateurs
export const useGetUsers = () => {
    return useQuery({
        queryKey: ["useGetUsers"],
        queryFn: () => request("/api/admin/users", "GET"),
        refetchOnWindowFocus: false,
    });
};

// Désactiver un compte
export const useDeactivateAccount = () => {
    return useMutation({
        mutationKey: ["useDeactivateAccount"],
        mutationFn: ({ id, formData }) => request(`/api/admin/users/${id}/status`, "PUT", formData),
    });
};