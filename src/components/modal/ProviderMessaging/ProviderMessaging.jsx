import { useState } from 'react'
import { ChatList } from './ChatList'
import { ChatWindow } from './ChatWindow'
// import { RightPanel } from './RightPanel'
import { ModalCard } from '../../../ui/ModalCard'
import { contacts } from './data'

export function ProviderMessaging() {
    const [selectedContact, setSelectedContact] = useState(contacts[0])
    const [showMobileChat, setShowMobileChat] = useState(false)
    const [isAvisOpen, setIsAvisOpen] = useState(false) // Exemple d'usage de ta ModalCard

    const handleSelect = (contact) => {
        setSelectedContact(contact)
        setShowMobileChat(true)
    }

    return (
        <ModalCard
            title={'Messages clients'}
            closeModal={() => setIsAvisOpen(false)}
            isWide={true}
        >
            <div className="flex overflow-hidden font-sans ">
                {/* Colonne Gauche : Liste */}
                <div className={`${showMobileChat ? 'hidden' : 'flex'} md:flex w-full md:w-[320px] lg:w-[380px] flex-shrink-0 h-full`}>
                    <ChatList onSelectContact={handleSelect} selectedId={selectedContact?.id} />
                </div>

                {/* Colonne Centrale : Fenêtre de Chat */}
                <div className={`${showMobileChat ? 'flex' : 'hidden'} md:flex  h-full`}>
                    <ChatWindow contact={selectedContact} onBack={() => setShowMobileChat(false)} />
                </div>

                {/* Colonne Droite : Panel Info */}
                {/* <div className="hidden lg:block w-1/4 h-full flex-shrink-0 bg-gray-50/30">
                <RightPanel contact={selectedContact} onOpenReviews={() => setIsAvisOpen(true)} />
            </div> */}




            </div>
        </ModalCard>
    )
}