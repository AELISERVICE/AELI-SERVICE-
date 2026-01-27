import React from 'react'
import { AuthCard } from '../ui/AuthCard'
import { OtpForm } from '../components/auth/OtpForm'

export function OtpScreen() {
  return (
    <AuthCard
      headerTitle="Vérification"
      headerSubtitle="Entrez le code envoyé par mail pour sécuriser votre compte"
      title="OTP"
      subtitle="Vérification du code"
    >
      <div className="max-w-xs mx-auto">
        <OtpForm />
      </div>
    </AuthCard>
  )
}