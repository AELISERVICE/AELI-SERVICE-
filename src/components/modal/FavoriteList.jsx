import React from 'react'
import { FavoriteCard } from '../../ui/FavoriteCard'
const businesses = [
    {
        name: 'Salon Marie',
        image:
            'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=1000',
        rating: 4.8,
        reviewCount: 25,
        description:
            'Coiffure professionnelle avec des techniques modernes et des produits de haute qualité pour sublimer votre beauté naturelle.',
        location: 'Douala',
        dateAdded: '15 Jan 2026',
        isVerified: true,
        isPremium: true,
    },
    {
        name: 'Traiteur Fatou',
        image:
            'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=1000',
        rating: 4.5,
        reviewCount: 18,
        description:
            'Cuisine traditionnelle camerounaise authentique pour vos événements. Des saveurs uniques qui rappellent la maison.',
        location: 'Yaoundé',
        dateAdded: '10 Jan 2026',
        isVerified: true,
        isPremium: true,
    },
    {
        name: 'Traiteur Fatou',
        image:
            'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=1000',
        rating: 4.5,
        reviewCount: 18,
        description:
            'Cuisine traditionnelle camerounaise authentique pour vos événements. Des saveurs uniques qui rappellent la maison.',
        location: 'Yaoundé',
        dateAdded: '10 Jan 2026',
        isVerified: true,
        isPremium: true,
    },
]
export function FavoriteList({ closeFavorite, onContact }) {
    return (
        <div
            onClick={() => closeFavorite()}
            className="fixed w-full bg-black/60 backdrop-blur-sm h-screen flex flex-col z-20 "
        >
            <div
                // Empêche le clic à l'intérieur de fermer la modale
                onClick={(e) => e.stopPropagation()}
                className="w-full lg:w-[40%] xl:w-[30%] h-full flex flex-col bg-[#FAFAFB] px-4"
            >
                <header className="py-8 md:py-10 flex-shrink-0">
                    <h1 className="text-3xl font-bold text-[#0F172A]">Favories</h1>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] flex-1 min-h-0">
                    {/* Indicateur de scroll optionnel à gauche */}
                    <div className="hidden md:flex flex-col gap-2 p-4 justify-center items-center">
                        <div className="w-1.5 h-12 bg-purple-200 rounded-full"></div>
                        <div className="w-1.5 h-12 bg-purple-700 rounded-full"></div>
                        <div className="w-1.5 h-12 bg-purple-200 rounded-full"></div>
                    </div>

                    {/* Zone de Scroll */}
                    <div className="flex flex-col gap-4 overflow-y-auto h-full  flex-1 pb-10 custom-scrollbar">
                        {businesses.map((business, index) => (
                            <div key={index} className="flex-shrink-0"> {/* FORCE LA TAILLE ICI */}
                                <FavoriteCard {...business} onContact={onContact} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}