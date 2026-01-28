import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Briefcase, X, Check } from 'lucide-react'
import { SectionHeader } from '../../ui/SectionHeader'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'
import { FormCard } from '../../ui/FormCard'
import { TermsSection } from "./TermsSection"

export function ProviderInfoForm() {
    const navigate = useNavigate()
    const [agreed, setAgreed] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        gender: '',
        country: '',
        email: '',
        phone: '',
        idNumber: '',
        businessContact: '',
        businessName: '',
        description: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!agreed) {
            alert("Veuillez accepter les conditions")
            return
        }
        console.log("Données envoyées au serveur :", formData)
    }

    return (
        <FormCard
            title="Inscription Prestataire"
            subtitle="Veuillez remplir toutes les informations requises pour compléter votre inscription"
        >
            <form className="space-y-10" onSubmit={handleSubmit}>
                <section>
                    <SectionHeader
                        icon={User}
                        title="Informations Personnelles"
                        colorClass="text-blue-600"
                    />

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <Input
                            name="name"
                            label="Prénom *"
                            placeholder="Prénom"
                            onChange={handleChange}
                        />

                        <Input
                            name="surname"
                            label="Nom *"
                            placeholder="Nom"
                            onChange={handleChange}
                        />

                        <Input
                            name="gender"
                            label="Genre *"
                            type="select"
                            onChange={handleChange}
                            options={[
                                { value: 'male', label: 'Homme' },
                                { value: 'female', label: 'Femme' }
                            ]}
                        />

                        <Input
                            name="email"
                            label="Adresse E-mail *"
                            type="email"
                            placeholder="email@exemple.com"
                            onChange={handleChange}
                        />

                        <Input
                            name="phone"
                            label="Téléphone *"
                            type="tel"
                            placeholder="6xx xxx xxx"
                            onChange={handleChange}
                        />
                    </div>
                </section>
                <section>
                    <SectionHeader
                        icon={Briefcase}
                        title="Informations sur la Structure"
                        colorClass="text-purple-600"
                    />

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <Input
                            name="photo"
                            label="Photo / Logo *"
                            type="file"
                            onChange={handleChange}
                            className="h-[250px]"
                        />

                        <div className="space-y-6">
                            <Input
                                name="idNumber"
                                label="Numéro CNI"
                                placeholder="CNI"
                                onChange={handleChange}
                            />

                            <Input
                                name="businessName"
                                label="Entreprise"
                                placeholder="Nom structure"
                                onChange={handleChange}
                            />

                            <Input
                                name="businessContact"
                                label="Contact Pro"
                                placeholder="Contact"
                                onChange={handleChange}
                            />
                        </div>

                        <Input
                            name="description"
                            label="Description *"
                            type="textarea"
                            placeholder="Vos services..."
                            onChange={handleChange}
                        />
                    </div>
                </section>
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