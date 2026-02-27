import { useQuery, useMutation } from "@tanstack/react-query";
import { request } from "../api/apiClient";

// create reviews
export const useContact= () => {
    return useMutation({
        mutationKey: ["useContact"],
        mutationFn: (formData) => request("/api/contacts", "POST", formData),
    });
};