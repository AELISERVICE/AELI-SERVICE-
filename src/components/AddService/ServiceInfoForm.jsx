import React, { useState } from 'react'
import { Briefcase } from 'lucide-react'
import { SectionHeader } from '../../ui/SectionHeader'
import { Input } from '../../ui/Input'

export function ServiceInfoForm({ onChange }) {
    const [formData, setFormData] = useState({
        photo: null,
        title: '',
        description: ''
    })

    const handleChange = (e) => {
        const { name, value, files } = e.target
        // Pour le type "file", on récupère le fichier, sinon la valeur
        const val = name === 'photo' ? files[0] : value

        const newData = { ...formData, [name]: val }
        setFormData(newData)
        if (onChange) onChange(newData)
    }

    return (
        <section className="mt-2">
            <SectionHeader
                icon={Briefcase}
                title="Information sur le service"
                colorClass="text-purple-600"
            />

            {/* On utilise une seule colonne (grid-cols-1) pour empiler les éléments comme sur la photo */}
            <div className="flex flex-col gap-y-6">

                {/* 1. Profile Photo (Zone pointillée sur la photo) */}
                <Input
                    name="photo"
                    label="Photo"
                    type="file"
                    required
                    onChange={handleChange}
                />

                {/* 2. titre */}
                <Input
                    name="title"
                    label="Titre"
                    placeholder="Enter your ID card number"
                    required
                    onChange={handleChange}
                />

                {/* 3. Activity Description (Le textarea large) */}
                <Input
                    name="description"
                    label="Description service"
                    type="textarea"
                    placeholder="Describe your services..."
                    required
                    onChange={handleChange}
                />
            </div>
        </section>
    )
}