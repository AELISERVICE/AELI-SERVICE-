import React from 'react'
import { ModalCard } from '../../ui/ModalCard'
import { FavoriteCard } from '../../ui/FavoriteCard'
import { Button } from '../../ui/Button'
import { Heart, MapPin, Star } from 'lucide-react'


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
        <ModalCard
            title="Favoris"
            closeModal={closeFavorite}
        >
            <div className="flex flex-col gap-4 overflow-y-auto h-full  flex-1 pb-10 custom-scrollbar no-scrollbar">
                {businesses.map((business, index) => (
                    <div key={index} className="flex-shrink-0">
                        <FavoriteCard
                            {...business}
                            actions={[
                                <button
                                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                    aria-label="Add to favorites"
                                >
                                    <Heart className="w-4 h-4 text-red-500 fill-current" />
                                </button>,
                                <Button
                                    variant="softRed"
                                    size="sm"
                                    onClick={onContact}
                                    className="rounded-xl px-5"
                                >
                                    Contacter
                                </Button>
                            ]
                            }
                        />
                    </div>
                ))}
            </div>
        </ModalCard>
    )
}