import { useQuery, useMutation } from "@tanstack/react-query";
import { request } from "../api/apiClient";

// get plans
export const useGetPlans = () => {
    return useQuery({
        queryKey: ["useGetPlans"],
        queryFn: () => request("/api/subscriptions/plans", "GET"),
    });
};

// get abonnement provider
export const useGetAbonnementProvider = () => {
    return useQuery({
        queryKey: ["useGetAbonnementProvider"],
        queryFn: () => request("/api/subscriptions/my", "GET"),
    });
};

// subscribe
export const useSubscribe = () => {
    return useMutation({
        mutationKey: ["useSubscribe"],
        mutationFn: (formData) => request("/api/payments/notchpay/initialize", "POST", formData),
    });
};
