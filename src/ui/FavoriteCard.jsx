import React from 'react'
import { Heart, MapPin, Star } from 'lucide-react'
import { Button } from './Button' // Ajuste le chemin selon ton architecture

export function FavoriteCard({
    name,
    image,
    rating,
    reviewCount,
    description,
    location,
    dateAdded,
    onContact // N'oublie pas de passer la fonction de contact si besoin
}) {
    return (
        <div className="group flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
            {/* Image Container */}
            <div className="relative h-48 sm:h-56 w-full overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />

                {/* Heart Button */}
                <button
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    aria-label="Add to favorites"
                >
                    <Heart className="w-4 h-4 text-red-500 fill-current" />
                </button>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-5">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{name}</h3>
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-bold text-gray-900">{rating}</span>
                        <span className="text-sm text-gray-500">({reviewCount})</span>
                    </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                    {description}
                </p>

                <div className="flex items-center gap-2 text-gray-500 mb-6">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{location}</span>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <span className="text-xs text-gray-400">Ajouté le {dateAdded}</span>

                    {/* Utilisation de ton bouton UI customisé */}
                    <Button
                        variant="softRed"
                        size="sm"
                        onClick={onContact}
                        className="rounded-xl px-5"
                    >
                        Contacter
                    </Button>
                </div>
            </div>
        </div>
    )
}