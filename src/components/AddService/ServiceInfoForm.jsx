import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, X, Check } from 'lucide-react'
import { SectionHeader } from '../../ui/SectionHeader'
import { Input } from '../../ui/Input'
import { Button } from '../../ui/Button'

export function ServiceInfoForm() {
    const navigate = useNavigate()
    const [agreed] = useState(true) // On garde agreed à true par défaut
    const [formData, setFormData] = useState({
        photo: null,
        title: '',
        description: ''
    })

    const handleChange = (e) => {
        const { name, value, files } = e.target
        const val = name === 'photo' ? files[0] : value

        setFormData(prev => ({
            ...prev,
            [name]: val
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log("Données envoyées :", formData)
    }

    return (
        <form className="p-2 sm:p-4 space-y-10" onSubmit={handleSubmit}>
            <section className="mt-2">
                <SectionHeader
                    icon={Briefcase}
                    title="Information sur le service"
                    colorClass="text-purple-600"
                />

                <div className="flex flex-col gap-y-6">
                    <Input
                        name="photo"
                        label="Photo"
                        type="file"
                        required
                        onChange={handleChange}
                    />
                    <Input
                        name="title"
                        label="Titre"
                        placeholder="Entrez le titre du service"
                        required
                        onChange={handleChange}
                    />
                    <Input
                        name="description"
                        label="Description service"
                        type="textarea"
                        placeholder="Décrivez vos services..."
                        required
                        onChange={handleChange}
                    />
                </div>
            </section>
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
    )
}