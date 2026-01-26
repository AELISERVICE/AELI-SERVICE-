import React from 'react'
import { ArrowRight, ShoppingBag } from 'lucide-react'



export function RecommendationCard({ title, description, isActive }) {
    return (
        <div
            className={`
        snap-center shrink-0 transition-all duration-700 ease-in-out overflow-hidden relative rounded-3xl h-[320px]
        ${isActive
                    ? 'w-[full] md:w-[800px] bg-[#0f0f1a] opacity-100' // Taille grande quand actif
                    : 'w-[250px] md:w-[300px] bg-gradient-to-br from-gray-800 to-gray-900 opacity-60 scale-95' // Taille petite
                }
      `}
        >
            {/* Contenu commun ou conditionnel */}
            <div className="relative z-10 h-full flex flex-col p-8 justify-between">

                {/* En-tête : Logo Shop (visible surtout si actif) */}
                <div className={`transition-all duration-500 ${isActive ? 'scale-100' : 'scale-75 origin-top-left'}`}>
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                        <ShoppingBag className="text-pink-500" size={24} />
                    </div>
                </div>

                {/* Corps du texte */}
                <div className={`transition-all duration-500 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-80'}`}>
                    <h3 className={`font-bold text-white mb-2 ${isActive ? 'text-3xl' : 'text-xl'}`}>
                        {title}
                    </h3>

                    {/* La description ne s'affiche ou ne s'agrandit que si actif */}
                    <p className={`text-gray-400 text-sm leading-relaxed transition-all duration-500 ${isActive ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                        {description}
                    </p>
                </div>

                {/* Action */}
                <div className="mt-4">
                    <button className={`
            flex items-center gap-2 rounded-full font-medium transition-all
            ${isActive
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 text-white'
                            : 'text-gray-300 group-hover:text-white'
                        }
          `}>
                        {isActive ? 'Consulter catalogue' : 'Voir plus'} <ArrowRight size={16} />
                    </button>
                </div>
            </div>

            {/* Effets de lumière en fond (uniquement si actif) */}
            {isActive && (
                <>
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-900/30 to-transparent"></div>
                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-purple-600 rounded-full blur-[100px] opacity-20"></div>
                </>
            )}
        </div>
    )
}