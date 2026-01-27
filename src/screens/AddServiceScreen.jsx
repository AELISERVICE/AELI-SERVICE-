import React from 'react'
import { FormCard } from '../ui/FormCard'
import { ServiceInfoForm } from "../components/AddService/ServiceInfoForm"

export function AddServiceScreen() {
    return (
        <FormCard
            title="Ajouter un Service"
            subtitle="Veuillez remplir les informations requises pour ajouter votre service"
        >
            <ServiceInfoForm />
        </FormCard>
    )
}