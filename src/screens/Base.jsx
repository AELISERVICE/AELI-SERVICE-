import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/global/Sidebar'
import { Header } from '../components/global/header'
import { Messagecustomer } from '../components/modal/Messagecustomer'
import { ContactCustomer } from '../components/modal/ContactCustomer'
import { FeedbackCard } from '../components/modal/FeedbackCard'
import { FavoriteList } from '../components/modal/FavoriteList'
import { ReviewList } from '../components/modal/ReviewList'



export function Base() {
    const MODALS = { NONE: 0, MESSAGE: 1, FEEDBACK: 2, CONTACT: 3, FAVORITE: 4, REVIEW: 5 };
    const [activeModal, setActiveModal] = useState(null);
    const closeModal = () => setActiveModal(MODALS.NONE);

    return (
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] min-h-screen bg-[#FAFAFB] font-sans text-slate-900 relative">
            <aside className="h-full">
                <Sidebar
                    onOpenMessage={() => setActiveModal(MODALS.MESSAGE)}
                    onOpenFavorite={() => setActiveModal(MODALS.FAVORITE)}
                    onOpenReview={() => setActiveModal(MODALS.REVIEW)}
                    activeModal={activeModal}
                    MODALS={MODALS}
                />
            </aside>
            <main className="h-screen overflow-y-auto">
                <div className="flex flex-col relative mx-auto ">
                    <div className="p-4 md:p-8 lg:p-10">
                        <Header />
                        <div className="mt-6 ">
                            <Outlet context={{
                                openContact: () => setActiveModal(MODALS.CONTACT),
                                openFeedback: () => setActiveModal(MODALS.FEEDBACK)
                            }} />
                        </div>
                    </div>
                    {activeModal === MODALS.MESSAGE && (
                        <Messagecustomer closeMessage={closeModal} />
                    )}
                    {activeModal === MODALS.FEEDBACK && (
                        <FeedbackCard closeFeedback={closeModal} />
                    )}
                    {activeModal === MODALS.FAVORITE && (
                        <FavoriteList
                            closeFavorite={closeModal}
                            onContact={() => setActiveModal(MODALS.CONTACT)}
                        />
                    )}
                    {activeModal === MODALS.REVIEW && (
                        <ReviewList closeReview={closeModal} />
                    )}
                </div>
            </main>
            {activeModal === MODALS.CONTACT && (
                <ContactCustomer closeContact={closeModal} />
            )}
        </div>
    )
}