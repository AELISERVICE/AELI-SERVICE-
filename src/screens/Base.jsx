import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/global/Sidebar'
import { Header } from '../components/global/header'
import { Messagecustomer } from '../components/modal/Messagecustomer'
import { ContactCustomer } from '../components/modal/ContactCustomer'
import { FeedbackCard } from '../components/modal/FeedbackCard'
import { FavoriteList } from '../components/modal/FavoriteList'

export function Base() {
    // 1. États pour gérer l'affichage des modales
    const [isMessageOpen, setIsMessageOpen] = useState(false)
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
    const [isContactOpen, setIsContactOpen] = useState(false)
    const [isFavoriteOpen, setIsFavoriteOpen] = useState(false)

    return (
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] min-h-screen bg-[#FAFAFB] font-sans text-slate-900 relative">

            {/* Sidebar avec les fonctions d'ouverture */}
            <aside className="h-full">
                <Sidebar
                    onOpenMessage={() => setIsMessageOpen(true)}
                    onOpenFavorite={() => setIsFavoriteOpen(true)}
                />
            </aside>

            <main className="h-screen overflow-y-auto">
                <div className="flex flex-col relative mx-auto ">
                    <div className="p-4 md:p-8 lg:p-10">
                        <Header />

                        <div className="mt-6 ">
                            <Outlet context={{
                                openContact: () => setIsContactOpen(true),
                                openFeedback: () => setIsFeedbackOpen(true)
                            }} />
                        </div>
                    </div>

                    {/* --- MODALES --- */}
                    {isMessageOpen && (
                        <Messagecustomer closeMessage={() => setIsMessageOpen(false)} />
                    )}
                    {isFeedbackOpen && (
                        <FeedbackCard closeFeedback={() => setIsFeedbackOpen(false)} />
                    )}
                    {isFavoriteOpen && (
                        <FavoriteList closeFavorite={() => setIsFavoriteOpen(false)} onContact={() => setIsContactOpen(true)} />
                    )}
                </div>
            </main>
            {isContactOpen && (
                <ContactCustomer closeContact={() => setIsContactOpen(false)} />
            )}

        </div>
    )
}