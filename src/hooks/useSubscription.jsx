import { useMutation, useQuery } from "@tanstack/react-query";
import { request } from "../api/apiClient";

// Liste des abonnements
export const usePayments = () => {
    return useQuery({
        queryKey: ["usePayments"],
        queryFn: () => request("/api/admin/payments", "GET"),
        refetchOnWindowFocus: false,
    });
};
