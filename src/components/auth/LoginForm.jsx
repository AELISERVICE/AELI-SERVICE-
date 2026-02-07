import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'
// import { AuthCard } from '../../ui/AuthCard'

export function LoginForm() {
    const navigate = useNavigate()

    return (
        <form className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
                <div className="space-y-6">
                    <Input
                        label="Email"
                        type="email"
                        placeholder="exemple@gmail.com"
                    />
                    <Input
                        label="Mot de passe"
                        type="password"
                        placeholder="*******"
                    />

                    <div className="space-y-4">
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            onClick={() => navigate('/dashboard')}
                            className="w-full"
                        >
                            Confirmer
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