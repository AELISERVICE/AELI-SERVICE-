import React, { useState } from 'react'
import { StatsProvider } from '../components/provider/StatsProvider'
import { ServiceProvider } from "../components/provider/ServiceProvider"
import { BarChart3, X } from 'lucide-react' // Import des icônes

export function ProviderScreen() {
    const [showStats, setShowStats] = useState(false)

    return (
        <main className="flex-1 flex flex-col xl:flex-row h-screen overflow-hidden relative">

            {/* Contenu Principal */}
            <div className="flex-1 h-full overflow-y-auto py-4 md:p-2 md:pr-4 no-scrollbar">
                <div className="mx-auto">
                    <ServiceProvider />
                </div>
            </div>

            {/* Bouton Flottant (Mobile uniquement : xl:hidden) */}
            <button
                onClick={() => setShowStats(true)}
                className="xl:hidden fixed bottom-6 right-6 bg-[#E8524D] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform active:scale-95"
            >
                <BarChart3 size={24} />
            </button>

            {/* Overlay sombre quand les stats sont ouvertes sur mobile */}
            {showStats && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm  xl:hidden"
                    onClick={() => setShowStats(false)}
                />
            )}

            {/* Section Statistiques */}
            <div className={`
                /* Mode Desktop (xl) */
                xl:static xl:w-[350px] xl:translate-x-0 xl:flex 
                /* Mode Mobile (Drawer) */
                fixed right-0 top-0 h-full w-[85%] sm:w-[400px]
                bg-white md:bg-transparent transition-transform duration-300 ease-in-out 
                ${showStats ? 'translate-x-0' : 'translate-x-full'}
            `}>
                <div className="flex flex-col h-full w-full relative">
                    {/* Bouton pour fermer le drawer sur mobile */}
                    <button
                        onClick={() => setShowStats(false)}
                        className="xl:hidden absolute top-4 left-4 p-2 text-gray-400 hover:bg-gray-50 rounded-lg z-10"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex-1 overflow-y-auto no-scrollbar py-12 xl:py-0">
                        <StatsProvider />
                    </div>
                </div>
            </div>
        </main>
    )
}