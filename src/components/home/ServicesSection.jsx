import React from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { ProductCard } from '../../ui/productCard'
import { Button } from '../../ui/Button'

const DATA = [
    {
        id: 1,
        name: 'Luxe & Volupté',
        category: 'Mode & Accessoires',
        description: 'Boutique spécialisée dans le prêt-à-porter haut de gamme et accessoires de créateurs.',
        location: 'Yaounde, Nkolbisson',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 2,
        name: 'Éclat Naturel',
        category: 'Beauté & Cosmétique',
        description: 'Produits de soin bio et rituels bien-être issus de l\'agriculture locale.',
        location: 'Yaounde, Melen',
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 3,
        name: 'Urban Tech',
        category: 'Électronique',
        description: 'Le meilleur de l\'innovation et des gadgets connectés pour votre quotidien.',
        location: 'Douala,Bepanda',
        rating: 4.2,
        image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 4,
        name: 'Maison Bohème',
        category: 'Décoration',
        description: 'Mobilier artisanal et objets de décoration pour un intérieur unique et chaleureux.',
        location: 'Douala, deido',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1615184697985-c9bde1b07da7?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 5,
        name: 'La Galerie du Temps',
        category: 'Horlogerie',
        description: 'Montres de luxe et pièces de collection pour les passionnés d\'horlogerie fine.',
        location: 'Tchad, ndjamena',
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 6,
        name: 'Sport Élite',
        category: 'Sport & Loisirs',
        description: 'Équipements professionnels pour toutes les disciplines sportives.',
        location: 'Ebolowa, Quartier',
        rating: 4.3,
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
    }
]

export function ServicesSection() {
    const navigate = useNavigate()
    const { openContact, openFeedback, openSidebar } = useOutletContext()

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {DATA.map((item) => (
                <ProductCard
                    key={item.id}
                    {...item}
                    isStructure={true}
                    onContact={openContact}
                    onFeedback={openFeedback}
                    actions={[
                        <Button
                            variant="gradient"
                            size="md"
                            onClick={() => navigate('/consult-provider', { state: { mode: "consultationCustomers", data: item } })}
                            className="rounded-full px-6"
                        >
                            <p className={`flex ${openSidebar ? "md:flex " : "md:hidden xl:flex"}`}>Consulter</p>
                            <ArrowRight size={16} className={`ml-2 ${openSidebar ? "md:hidden xl:flex" : "xl:hidden"}`} />
                        </Button>
                    ]}
                />
            ))}
        </div>
    )
}