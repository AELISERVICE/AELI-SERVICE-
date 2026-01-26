import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormCard } from '../ui/FormCard'
import { Button } from '../ui/Button'
import { TermsSection } from "../components/RegistrationProvider/TermsSection"
import { ProviderInfoForm } from "../components/RegistrationProvider/ProviderInfoForm"
import { X, Check } from 'lucide-react'

export function RegistrationProviderScreen() {
  const navigate = useNavigate()
  const [agreed, setAgreed] = useState(false)
  const [allData, setAllData] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!agreed) return alert("Please accept terms")
    console.log("Form submitted")
  }

  return (
    <FormCard
      title="Inscription Prestataire"
      subtitle="Veuillez remplir toutes les informations requises pour compléter votre inscription"
    >
      <form className="space-y-10" onSubmit={handleSubmit}>
        <ProviderInfoForm onChange={(data) => setAllData(data)}/>
        <TermsSection
          agreed={agreed}
          onToggle={(checked) => setAgreed(checked)}
        />
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
          <Button
            variant="secondary"
            className="w-full sm:w-auto gap-2"
            type="button"
            onClick={() => navigate(-1)}
          >
            <X className="w-4 h-4" />
            Retour
          </Button>

          <Button
            variant="gradient"
            type="submit"
            className="w-full sm:w-auto gap-2"
            disabled={!agreed}
          >
            <Check className="w-4 h-4" />
            Soumettre
          </Button>
        </div>
      </form>
    </FormCard>
  )
}