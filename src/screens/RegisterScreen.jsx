import React from 'react'
import { AuthCard } from '../ui/AuthCard'
import { RegisterForm } from '../components/auth/RegisterForm'

export function RegisterScreen() {
  return (
    <AuthCard
      headerTitle="Content de te voir!"
      headerSubtitle="Utilisez ce formulaires pour vous inscrire"
      title="Inscription"
      subtitle="Entrez vos informations afin de vous inscrire"
      isWide={true}
    >
      <RegisterForm />
    </AuthCard>
  )
}