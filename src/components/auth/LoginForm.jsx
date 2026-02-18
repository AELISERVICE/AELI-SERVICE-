import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from "react-toastify";
import { Loader2 } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { useLogin } from '../../hooks/useAuth';

export function LoginForm() {
    const navigate = useNavigate()
    const { mutate, isPending, isError, error, isSuccess, data } = useLogin();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })

    const isInvalid =
        !formData.email ||
        !formData.password;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        mutate(formData)
    }

    useEffect(() => {
        if (isSuccess && data?.success) {
            localStorage.setItem('accessToken', data.data.accessToken);
            localStorage.setItem('refreshToken', data.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            toast.success(data.message);
            navigate("/dashboard");
        }

        if (isError) {
            const mainMessage = error?.message;
            toast.error(mainMessage);

            const backendErrors = error?.response?.errors;
            if (Array.isArray(backendErrors)) {
                backendErrors.forEach((err) => {
                    toast.info(err.message);
                });
            }
        }
    }, [isSuccess, isError, data, error]);


    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
                <div className="space-y-6">
                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="exemple@gmail.com"
                    />
                    <Input
                        label="Mot de passe"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="*******"
                    />

                    <div className="space-y-4">
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            disabled={isInvalid || isPending}
                            className="w-full"
                        >
                            {isPending ? (
                                // Utiliser une clé unique pour l'état de chargement
                                <span key="loading-state" className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Verification...
                                </span>
                            ) : (
                                // Utiliser une clé unique pour l'état initial
                                <span key="idle-state">Se connecter</span>
                            )}
                        </Button>
                        <div className="flex justify-end mt-2">
                            <button
                                className=" text-sm text-[#E8524D] font-semibold hover:underline cursor-pointer bg-transparent border-none "
                            >
                                Mot de passe oublié?
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    )
}