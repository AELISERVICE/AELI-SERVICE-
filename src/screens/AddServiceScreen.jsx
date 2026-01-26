import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormCard } from '../ui/FormCard'
import { Button } from '../ui/Button'
import { ServiceInfoForm } from "../components/AddService/ServiceInfoForm"
import { X, Check } from 'lucide-react'

export function AddServiceScreen() {
    const navigate = useNavigate()
    const [allData, setAllData] = useState({})
    const [agreed, setAgreed] = useState(true)

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log("Données envoyées :", allData)
        // Logique API ici
    }

    return (
        <FormCard
            title="Ajouter un Service"
            subtitle="Veuillez remplir les informations requises pour ajouter votre service"
        >
            <form className="p-2 sm:p-4 space-y-10" onSubmit={handleSubmit}>
                <ServiceInfoForm onChange={(data) => setAllData(data)} />

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
                        className="w-full sm:w-auto gap-2 px-8"
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