import React, { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from '../../ui/productCard'
import { Button } from '../../ui/Button'
import { SelectFilter } from '../global/SelectFilter';

const DATA = [
    {
        id: 1,
        name: 'Luxe & Volupté',
        category: 'Mode & Accessoires',
        description: 'Boutique spécialisée dans le prêt-à-porter haut de gamme et accessoires de créateurs.',
        location: 'Yaounde, Nkolbisson',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&q=80&w=800',
        activities: ["activites1", "activites2", "activites3"]
    },
    {
        id: 2,
        name: 'Éclat Naturel',
        category: 'Beauté & Cosmétique',
        description: 'Produits de soin bio et rituels bien-être issus de l\'agriculture locale.',
        location: 'Yaounde, Melen',
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=800',
        activities: ["activites1", "activites2", "activites3"]
    },
    {
        id: 3,
        name: 'Urban Tech',
        category: 'Électronique',
        description: 'Le meilleur de l\'innovation et des gadgets connectés pour votre quotidien.',
        location: 'Douala,Bepanda',
        rating: 4.2,
        image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=800',
        activities: ["activites1", "activites2", "activites3"]
    },
    {
        id: 4,
        name: 'Maison Bohème',
        category: 'Décoration',
        description: 'Mobilier artisanal et objets de décoration pour un intérieur unique et chaleureux.',
        location: 'Douala, deido',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1615184697985-c9bde1b07da7?auto=format&fit=crop&q=80&w=800',
        activities: ["activites1", "activites2", "activites3"]
    },
    {
        id: 5,
        name: 'La Galerie du Temps',
        category: 'Horlogerie',
        description: 'Montres de luxe et pièces de collection pour les passionnés d\'horlogerie fine.',
        location: 'Tchad, ndjamena',
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&q=80&w=800',
        activities: ["activites1", "activites2", "activites3"]
    },
    {
        id: 6,
        name: 'Sport Élite',
        category: 'Sport & Loisirs',
        description: 'Équipements professionnels pour toutes les disciplines sportives.',
        location: 'Ebolowa, Quartier',
        rating: 4.3,
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
        activities: ["activites1", "activites2", "activites3", "activites4"]
    }
]

export function ServicesSection() {
    const navigate = useNavigate();
    const { openContact, openFeedback, openSidebar } = useOutletContext();

    const [selectedActivity, setSelectedActivity] = useState('All');

    // 1. Extraire TOUTES les activités de TOUS les prestataires et en faire une liste unique
    // flatMap() permet de mettre à plat tous les tableaux "activities" en un seul
    const allActivities = [...new Set(DATA.flatMap(item => item.activities))];

    // 2. Filtrer : On vérifie si selectedActivity est présent dans le tableau item.activities
    const filteredData = selectedActivity === 'All'
        ? DATA
        : DATA.filter(item => item.activities.includes(selectedActivity));

    return (
        <div className="space-y-8">
            <div className="flex flex-row md:items-center justify-between gap-4">
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Services</h2>

                <SelectFilter
                    options={allActivities} // On passe la liste des activités uniques
                    value={selectedActivity}
                    onChange={setSelectedActivity}
                    label="Filtrer par activité"
                    className="w-60 "
                    classNameButon="shadow-sm"
                />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredData.map((item) => (
                    <ProductCard
                        key={item.id}
                        {...item}
                        isStructure={true}
                        onContact={openContact}
                        onFeedback={openFeedback}
                        actions={[
                            <Button
                                key="btn"
                                variant="gradient"
                                size="md"
                                onClick={() => navigate('/consult-provider', { state: { mode: "consultationCustomers", data: item } })}
                                className="rounded-full px-6"
                            >
                                <span className={openSidebar ? "md:inline hidden lg:inline" : "inline"}>Consulter</span>
                                <ArrowRight size={16} className="ml-2" />
                            </Button>
                        ]}
                    />
                ))}
            </div>

        </div>
    );
}