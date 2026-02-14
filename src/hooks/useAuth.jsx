import { useMutation } from "@tanstack/react-query";
import { request } from "../api/apiClient";


// login
export const useLogin = () => {
    return useMutation({
        mutationKey: ["useLogin"],
        mutationFn: (credentials) => request("/api/auth/login", "POST", credentials),
    });
};




