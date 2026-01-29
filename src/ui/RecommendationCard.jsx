import React from 'react'
import { ShoppingBag } from 'lucide-react'

export function RecommendationCard({ title, description, isActive, actions, image }) {
    return (
        <div
            className={`
                snap-center shrink-0 transition-all duration-700 ease-in-out overflow-hidden relative rounded-3xl h-[320px]
                ${isActive
                    ? 'w-full md:w-[800px] opacity-100 shadow-2xl shadow-purple-900/20'
                    : 'w-[250px] md:w-[300px] opacity-60 scale-95'
                }
            `}
        >
            {/* Image d'arrière-plan */}
            <div className="absolute inset-0 z-0">
                <img
                    src={image}
                    alt={title}
                    className={`w-full h-full object-cover transition-all duration-700 ${isActive ? 'scale-110 brightness-50' : 'brightness-[0.3] grayscale-[0.5]'}`}
                />
                {/* Overlay dégradé pour garantir la lisibilité du texte blanc */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>

            <div className="relative z-10 h-full flex flex-col p-8 justify-between">
                <div className={`transition-all duration-500 ${isActive ? 'scale-100' : 'scale-75 origin-top-left'}`}>
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                        <ShoppingBag className="text-white" size={24} />
                    </div>
                </div>

                <div className={`transition-all duration-500 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-80'}`}>
                    <h3 className={`font-bold text-white mb-2 ${isActive ? 'text-3xl' : 'text-xl'}`}>
                        {title}
                    </h3>
                    <p className={`text-gray-200 text-sm leading-relaxed transition-all duration-500 ${isActive ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                        {description}
                    </p>
                </div>

                <div className="mt-4">
                    {actions && actions[0]}
                </div>
            </div>

            {/* Effet de lumière violette subtil uniquement si actif */}
            {isActive && (
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-purple-600 rounded-full blur-[100px] opacity-30 z-0"></div>
            )}
        </div>
    )
}