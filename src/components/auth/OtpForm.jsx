import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../ui/Button'
import { AuthCard } from '../../ui/AuthCard'

export function OtpForm() {
    const navigate = useNavigate()
    const [otp, setOtp] = useState(['', '', '', ''])
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)]

    const handleChange = (value, index) => {
        const char = value.slice(-1)
        const newOtp = [...otp]
        newOtp[index] = char
        setOtp(newOtp)

        if (char && index < 3) {
            inputRefs[index + 1].current?.focus()
        }
    }

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs[index - 1].current?.focus()
        }
    }

    const handlePaste = (e) => {
        const data = e.clipboardData.getData('text').slice(0, 4).split('')
        if (data.length > 0) {
            const newOtp = [...otp]
            data.forEach((char, index) => {
                if (index < 4) newOtp[index] = char
            })
            setOtp(newOtp)
            const nextFocus = data.length >= 4 ? 3 : data.length
            inputRefs[nextFocus].current?.focus()
        }
    }

    return (
        <AuthCard
            headerTitle="Vérification"
            headerSubtitle="Entrez le code envoyé par mail pour sécuriser votre compte"
            title="OTP"
            subtitle="Vérification du code"
        >
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                <div className="flex justify-between gap-2" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={inputRefs[index]}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(e.target.value, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className="w-14 h-16 md:w-16 md:h-20 text-center text-2xl font-bold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                        />
                    ))}
                </div>

                <Button
                    variant="gradient"
                    size="lg"
                    className="w-full py-4 text-xs tracking-widest uppercase"
                    onClick={() => navigate('/accueil')}
                    disabled={otp.some((d) => d === '')}
                >
                    Vérifier
                </Button>

                <div className="text-center">
                    <p className="text-sm text-slate-500">
                        Renvoyer le code ?{' '}
                        <button type="button" className="text-[#E8524D] font-bold hover:underline">
                            Renvoyer
                        </button>
                    </p>
                </div>
            </form>
        </AuthCard>
    )
}