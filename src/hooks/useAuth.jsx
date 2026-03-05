import { useMutation } from "@tanstack/react-query";
import { request } from "../api/apiClient";


// useLogin encapsulates data access and state management for its feature domain.
export const useLogin = () => {
    return useMutation({
        mutationKey: ["useLogin"],
        mutationFn: (credentials) => request("/api/auth/login", "POST", credentials),
    });
};




