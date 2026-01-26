import React, { useState } from 'react'
import { User, Briefcase } from 'lucide-react'
import { SectionHeader } from '../../ui/SectionHeader'
import { Input } from '../../ui/Input'

export function ProviderInfoForm({ onChange }) {
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
        const newData = { ...formData, [name]: value }
        setFormData(newData)
        if (onChange) onChange(newData)
    }

    return (
        <>
            {/* Section 1: Informations Personnelles */}
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
                        placeholder="Entrez votre prénom"
                        onChange={handleChange}
                    />
                    <Input
                        name="surname"
                        label="Nom *"
                        placeholder="Entrez votre nom"
                        onChange={handleChange}
                    />
                    <Input
                        name="gender"
                        label="Genre *"
                        type="select"
                        onChange={handleChange}
                        options={[
                            { value: '', label: 'Sélectionnez le genre' },
                            { value: 'male', label: 'Homme' },
                            { value: 'female', label: 'Femme' },
                        ]}
                    />
                    <Input
                        name="country"
                        label="Pays *"
                        type="select"
                        onChange={handleChange}
                        options={[
                            { value: '', label: 'Sélectionnez votre pays' },
                            { value: 'fr', label: 'France' },
                            { value: 'cm', label: 'Cameroun' },
                            { value: 'ca', label: 'Canada' },
                        ]}
                    />
                    <Input
                        name="email"
                        label="Adresse E-mail *"
                        type="email"
                        placeholder="exemple@email.com"
                        onChange={handleChange}
                    />
                    <Input
                        name="phone"
                        label="Téléphone *"
                        type="tel"
                        placeholder="Numéro de téléphone"
                        onChange={handleChange}
                    />
                </div>
            </section>

            {/* Section 2: Informations sur la Structure */}
            <section className="mt-10">
                <SectionHeader
                    icon={Briefcase}
                    title="Informations sur la Structure"
                    colorClass="text-purple-600"
                />
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <Input
                        name="photo"
                        label="Photo ou logo de la structure "
                        type="file"
                        required
                        onChange={handleChange}
                        className="h-[250px]"
                    />
                    <div className="space-y-6 col-span-1">
                        <Input
                            name="idNumber"
                            label="Numéro de CNI "
                            placeholder="Entrez le numéro de votre carte"
                            onChange={handleChange}
                        />
                        <Input
                            name="businessName"
                            label="Nom de l'entreprise "
                            placeholder="Nom de l'entreprise"
                            onChange={handleChange}
                        />
                        <Input
                            name="businessContact"
                            label="Contact Professionnel "
                            placeholder="Contact de l'entreprise"
                            onChange={handleChange}
                        />
                    </div>
                    <Input
                        name="description"
                        label="Description de l'activité "
                        type="textarea"
                        placeholder="Décrivez vos services et activités..."
                        required
                        onChange={handleChange}
                    />
                </div>
            </section>
        </>
    )
}