import { useMutation, useQuery } from "@tanstack/react-query";
import { request } from "../api/apiClient";

// usePayments encapsulates data access and state management for its feature domain.
export const usePayments = () => {
    return useQuery({
        queryKey: ["usePayments"],
        queryFn: () => request("/api/admin/payments", "GET"),
        refetchOnWindowFocus: false,
    });
};
