import { useMutation, useQuery } from "@tanstack/react-query";
import { request } from "../api/apiClient";


// Liste des candidatures
export const useProviderApplications = () => {
    return useQuery({
        queryKey: ["useProviderApplications"],
        queryFn: () => request("/api/admin/provider-applications", "GET"),
        // Optionnel : ne pas rafraîchir à chaque clic sur la fenêtre
        refetchOnWindowFocus: false,
    });
};

// Détail d'une candidature
export const useProviderApplicationsDetail = (id) => {
    return useQuery({
        queryKey: ["useProviderApplicationsDetail", id],
        queryFn: () => request(`/api/admin/provider-applications/${id}`, "GET"),
        refetchOnWindowFocus: false,
    });
}

// Prestataires non vérifiés
export const useProviderPending = () => {
    return useQuery({
        queryKey: ["useProviderApplicationsDetail"],
        queryFn: () => request("/api/admin/providers/pending", "GET"),
        refetchOnWindowFocus: false,
    });
};

// Valider/Rejeter un prestataire
export const useProvidersVerify = () => {
    return useMutation({
        mutationKey: ["useProvidersVerify"],
        mutationFn: (formData) => request(`/providers/:id/verify`, "PUT", formData),
    });
};