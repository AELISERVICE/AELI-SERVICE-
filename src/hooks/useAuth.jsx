import { useMutation } from "@tanstack/react-query";
import { request } from "../api/apiClient";

// register
export const useRegister = () => {
    return useMutation({
        mutationKey: ["useRegister"],
        mutationFn: (formData) => request("/api/auth/register", "POST", formData),
    });
};

// otp
export const useOtp = () => {
    return useMutation({
        mutationKey: ["useOtp"],
        mutationFn: (formData) => request("/api/auth/verify-otp", "POST", formData),
    });
};

// resend otp
export const useResendOtp = () => {
    return useMutation({
        mutationKey: ["useResendOtp"],
        mutationFn: (formData) => request("/api/auth/resend-otp", "POST", formData),
    });
};

// login
export const useLogin = () => {
    return useMutation({
        mutationKey: ["useLogin"],
        mutationFn: (credentials) => request("/api/auth/login", "POST", credentials),
    });
};

// logout
export const useLogout = () => {
    return useMutation({
        mutationKey: ["useLogout"],
        mutationFn: () => {
            const refreshToken = localStorage.getItem("refreshToken");
            const payload = refreshToken ? { refreshToken } : null;
            return request("/api/auth/logout", "POST", payload);
        },
    });
};

// forgot password
export const useForgotPassword = () => {
    return useMutation({
        mutationKey: ["forgot-password"],
        mutationFn: (formData) => request("/api/auth/forgot-password", "POST", formData),
    });
};

