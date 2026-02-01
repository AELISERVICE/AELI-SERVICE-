import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/global/Sidebar'
import { Header } from '../components/global/header'
import { Messagecustomer } from '../components/modal/Messagecustomer'
import { ContactCustomer } from '../components/modal/ContactCustomer'
import { FeedbackCard } from '../components/modal/FeedbackCard'
import { FavoriteList } from '../components/modal/FavoriteList'
import { ReviewList } from '../components/modal/ReviewList'
import { Confirmation } from '../components/modal/Confirmation'
import { ProviderMessaging } from '../components/modal/ProviderMessaging/ProviderMessaging'



export function Base() {
    const MODALS = { NONE: 0, MESSAGE: 1, FEEDBACK: 2, CONTACT: 3, FAVORITE: 4, REVIEW: 5, MESSAGING: 6, CONFIRM: 7 };
    const [activeModal, setActiveModal] = useState(null);
    const [activeModal2, setActiveModal2] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // État pour le burger

    const closeModal = () => setActiveModal(MODALS.NONE);
    const closeModal2 = () => setActiveModal2(MODALS.NONE);

    return (
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] min-h-screen bg-[#FAFAFB] font-sans text-slate-900 relative">
            <aside>
                <Sidebar
                    onOpenMessage={() => { setActiveModal(MODALS.MESSAGE); setIsSidebarOpen(false); }}
                    onOpenFavorite={() => { setActiveModal(MODALS.FAVORITE); setIsSidebarOpen(false); }}
                    onOpenReview={() => { setActiveModal(MODALS.REVIEW); setIsSidebarOpen(false); }}
                    activeModal={activeModal}
                    MODALS={MODALS}
                    isOpen={isSidebarOpen} // Prop pour l'ouverture mobile
                    onClose={() => setIsSidebarOpen(false)} // Prop pour fermer
                    closeModal={closeModal}
                />
            </aside>
            <main className="h-screen overflow-y-auto">
                <div className="flex flex-col relative mx-auto ">
                    <div className="p-4 md:p-8 lg:p-10">
                        <Header onOpenMenu={() => setIsSidebarOpen(true)} />
                        <div className="mt-6 ">
                            <Outlet context={{
                                openContact: () => setActiveModal2(MODALS.CONTACT),
                                openFeedback: () => setActiveModal(MODALS.FEEDBACK),
                                openMessaging: () => setActiveModal(MODALS.MESSAGING)

                            }} />
                        </div>
                    </div>
                    {activeModal === MODALS.MESSAGE && (
                        <Messagecustomer
                            closeMessage={closeModal}
                            onConfirmation={() => setActiveModal2(MODALS.CONFIRM)}
                        />
                    )}
                    {activeModal === MODALS.FEEDBACK && (
                        <FeedbackCard closeFeedback={closeModal} />
                    )}
                    {activeModal === MODALS.FAVORITE && (
                        <FavoriteList
                            closeFavorite={closeModal}
                            onContact={() => setActiveModal2(MODALS.CONTACT)}
                        />
                    )}
                    {activeModal === MODALS.REVIEW && (
                        <ReviewList closeReview={closeModal} />
                    )}
                    {activeModal === MODALS.MESSAGING && (
                        <ProviderMessaging closeMessaging={closeModal} />
                    )}
                </div>
            </main>
            {activeModal2 === MODALS.CONTACT && (
                <ContactCustomer closeContact={closeModal2} />
            )}
            {activeModal2 === MODALS.CONFIRM && (
                <Confirmation
                    closeConfirm={closeModal2}
                />
            )}

        </div>
    )
}