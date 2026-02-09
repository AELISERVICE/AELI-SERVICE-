import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ModalCard } from '../../ui/ModalCard'
import { FavoriteCard } from '../../ui/FavoriteCard'
import { CountItems } from '../global/CountItems'
import { Button } from '../../ui/Button'
import { Heart, MapPin, Star } from 'lucide-react'


const data = [
    {
        name: 'Salon Marie',
        image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=1000',
        rating: 4.8,
        description: 'Coiffure professionnelle avec des techniques modernes et des produits de haute qualité pour sublimer votre beauté naturelle.',
        location: 'Douala',
        dateAdded: '15 Jan 2026',
        activities: ["Coiffure", "Esthétique", "Mécanique"]
    },
    {
        name: 'Traiteur Fatou',
        image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=1000',
        rating: 4.5,
        description: 'Cuisine traditionnelle camerounaise authentique pour vos événements. Des saveurs uniques qui rappellent la maison.',
        location: 'Yaoundé',
        dateAdded: '10 Jan 2026',
        activities: ["activites1", "activites3"]
    },
    {
        name: 'Traiteur Fatou',
        image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=1000',
        rating: 4.5,
        description: 'Cuisine traditionnelle camerounaise authentique pour vos événements. Des saveurs uniques qui rappellent la maison.',
        location: 'Yaoundé',
        dateAdded: '10 Jan 2026',
        activities: ["Ménage", "Plomberie", "Électricité"]
    },
]


export function FavoriteList({ closeFavorite }) {
    const scrollRef = useRef(null)
    const navigate = useNavigate()

    return (
        <ModalCard
            title="Favoris"
            closeModal={closeFavorite}
        >
            <CountItems count={data.length} scrollContainerRef={scrollRef} />
            <div
                ref={scrollRef}
                className="flex flex-col gap-4 overflow-y-auto h-full flex-1 pb-5 md:pb-10 custom-scrollbar no-scrollbar">
                {data.map((item, index) => (
                    <div key={index} data-index={index} className="flex-shrink-0">
                        <FavoriteCard
                            {...item}
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
                                    onClick={() => navigate('/consult-provider', { state: { mode: "consultationCustomers", data: item } }, closeFavorite())}
                                    className="rounded-xl px-5"
                                >
                                    Consulter
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