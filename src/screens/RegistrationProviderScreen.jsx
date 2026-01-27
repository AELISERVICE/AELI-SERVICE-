import React from 'react'
import { FormCard } from '../ui/FormCard'
import { ProviderInfoForm } from "../components/RegistrationProvider/ProviderInfoForm"

export function RegistrationProviderScreen() {
  return (
    <FormCard
      title="Inscription Prestataire"
      subtitle="Veuillez remplir toutes les informations requises pour compléter votre inscription"
    >
      <ProviderInfoForm />
    </FormCard>
  )
}