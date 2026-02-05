import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Briefcase, X, Check } from 'lucide-react'
import { SectionHeader } from '../../ui/SectionHeader'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'
import { FormCard } from '../../ui/FormCard'
import { TermsSection } from "./TermsSection"


const availableActivities = [
    "Ménage", "Plomberie", "Électricité", "Jardinage",
    "Coiffure", "Esthétique", "Mécanique", "Cours d'appui"
]

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
        imgcnirecto: '',
        imgcniverso: '',
        businessContact: '',
        businessName: '',
        location: '',
        description: '',
        activities: []
    })

    // Ajouter une activité
    const handleAddActivity = (e) => {
        const selected = e.target.value
        if (selected && !formData.activities.includes(selected)) {
            setFormData(prev => ({
                ...prev,
                activities: [...prev.activities, selected]
            }))
        }
        // Reset le select après sélection
        e.target.value = ""
    }

    // Supprimer une activité
    const removeActivity = (activityToRemove) => {
        setFormData(prev => ({
            ...prev,
            activities: prev.activities.filter(act => act !== activityToRemove)
        }))
    }

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
                            label="Nom"
                            placeholder="Nom"
                            onChange={handleChange}
                            required
                        />
                        <Input
                            name="surname"
                            label="Prénom"
                            placeholder="Prénom"
                            onChange={handleChange}
                            required
                        />
                        <Input
                            name="gender"
                            label="Genre"
                            type="select"
                            onChange={handleChange}
                            required
                            options={[
                                { value: 'male', label: 'Homme' },
                                { value: 'female', label: 'Femme' }
                            ]}
                        />
                        <Input
                            name="email"
                            label="Adresse E-mail"
                            type="email"
                            placeholder="email@exemple.com"
                            onChange={handleChange}
                            required
                        />
                        <Input
                            name="phone"
                            label="Téléphone"
                            type="tel"
                            placeholder="6xx xxx xxx"
                            onChange={handleChange}
                            required
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
                        <div className="flex flex-col gap-6">
                            <Input
                                name="idNumber"
                                label="Numéro CNI"
                                placeholder="CNI"
                                onChange={handleChange}
                                required
                            />
                            <div className="flex flex-col md:flex-row gap-6">
                                <Input
                                    name="imgcnirecto"
                                    label="Photo CNI Recto"
                                    type="file"
                                    onChange={handleChange}
                                    required
                                    className="h-[150px]"
                                />
                                <Input
                                    name="imgcniverso"
                                    label="Photo CNI Verso"
                                    type="file"
                                    onChange={handleChange}
                                    required
                                    className="h-[150px]"
                                />
                            </div>
                        </div>
                        <Input
                            name="photo"
                            label="Photo / Logo"
                            type="file"
                            onChange={handleChange}
                            required
                            className="h-[250px]"
                        />
                        <Input
                            name="businessName"
                            label="Entreprise"
                            placeholder="Nom structure"
                            onChange={handleChange}
                            required
                        />
                        <Input
                            name="businessContact"
                            label="Contact Pro"
                            placeholder="Contact"
                            onChange={handleChange}
                            required
                        />
                        <Input
                            name="location"
                            label="Localisation"
                            placeholder="Yaounde, nkolbisson"
                            onChange={handleChange}
                            required
                        />
                        <div className="space-y-3">
                            <Input
                                name="activitySelect"
                                label="Sélectionner vos activités"
                                type="select"
                                onChange={handleAddActivity}
                                required
                                options={[
                                    { value: '', label: 'Choisir une activité...' },
                                    ...availableActivities
                                        .filter(act => !formData.activities.includes(act))
                                        .map(act => ({ value: act, label: act }))
                                ]}
                            />

                            {/* Affichage des tags (activités sélectionnées) */}
                            <div className="flex flex-wrap gap-2">
                                {formData.activities.map((act) => (
                                    <span
                                        key={act}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-[#E8524D]/10 text-[#E8524D] text-sm font-medium rounded-full border border-[#E8524D]/20 animate-in zoom-in duration-200"
                                    >
                                        {act}
                                        <button
                                            type="button"
                                            onClick={() => removeActivity(act)}
                                            className="hover:bg-[#E8524D]/2 rounded-full p-0.5 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <Input
                            name="description"
                            label="Description "
                            type="textarea"
                            placeholder="Vos services..."
                            onChange={handleChange}
                            required
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
                        className="w-full sm:w-auto gap-2 py-3"
                        type="button"
                        onClick={() => navigate(-1)}
                    >
                        <X className="w-4 h-4" />
                        Retour
                    </Button>

                    <Button
                        variant="gradient"
                        type="submit"
                        className="w-full sm:w-auto gap-2 py-3"
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