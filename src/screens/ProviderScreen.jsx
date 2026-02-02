import React, { useState } from 'react'
import { useLocation } from 'react-router-dom';
import { StatsProvider } from '../components/provider/StatsProvider'
import { ServiceProvider } from "../components/provider/ServiceProvider"
import { ChevronLeft, X } from 'lucide-react' // Import des icônes

export function ProviderScreen() {
    const location = useLocation();
    const mode = location.state?.mode || "defaultMode";
    const data = location.state?.data || [];
    const [showStats, setShowStats] = useState(false)

    return (
        <main className="flex-1 flex flex-col xl:flex-row h-screen md:overflow-hidden relative">
            {/* Contenu Principal */}
            <div className="flex-1 h-full md:overflow-y-auto py-4 md:p-2 md:pr-4 no-scrollbar">
                <div className="mx-auto">
                    <ServiceProvider mode={mode} data={data}/>
                </div>
            </div>

            {/* Overlay sombre quand les stats sont ouvertes sur mobile */}
            {showStats && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm  xl:hidden"
                    onClick={() => setShowStats(false)}
                />
            )}

            {mode != "consultationCustomers" && (
                < StatsProvider showStats={showStats} setHideStats={() => setShowStats(false)} setShowStats={() => setShowStats(true)} />
            )}

        </main>
    )
}