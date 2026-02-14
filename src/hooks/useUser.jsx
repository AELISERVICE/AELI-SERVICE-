import { useMutation, useQuery } from "@tanstack/react-query";
import { request } from "../api/apiClient";


// Désactiver un compte
export const useDeactivateAccount = () => {
    return useMutation({
        mutationKey: ["useDeactivateAccount"],
        mutationFn: (formData) => request("/api/admin/users/:id/status", "PUT", formData),
    });
};