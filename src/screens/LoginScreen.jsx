import React from 'react'
import { AuthCard } from '../ui/AuthCard'
import { LoginForm } from '../components/auth/LoginForm'

export function LoginScreen() {
  return (
    <AuthCard 
      headerTitle="Content de te revoir!"
      headerSubtitle="Utilisez ce formulaire pour vous connecter à votre compte."
      title="Connexion"
      subtitle="Entrez vos informations pour accéder à votre espace"
    >
      <div className="max-w-md mx-auto">
         <LoginForm />
      </div>
    </AuthCard>
  )
}