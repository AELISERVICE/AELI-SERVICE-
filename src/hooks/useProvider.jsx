import { useMutation } from "@tanstack/react-query";
import { request } from "../api/apiClient";

// apply
export const useApplyProvider = () => {
    return useMutation({
        mutationKey: ["useApplyProvider"],
        mutationFn: (formData) => request("/api/providers/apply", "POST", formData),
    });
};