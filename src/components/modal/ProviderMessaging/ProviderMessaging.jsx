import { useState } from 'react'
import { ChatList } from './ChatList'
import { ChatWindow } from './ChatWindow'
// import { RightPanel } from './RightPanel'
import { ModalCard } from '../../../ui/ModalCard'
import { contacts } from './data'

export function ProviderMessaging({ closeMessaging }) {
    const [selectedContact, setSelectedContact] = useState(contacts[0])
    const [showMobileChat, setShowMobileChat] = useState(false)

    const handleSelect = (contact) => {
        setSelectedContact(contact)
        setShowMobileChat(true)
    }

    return (
        <ModalCard
            title={'Messages clients'}
            closeModal={closeMessaging}
            isWide={true}
        >
            <div className="flex overflow-hidden font-sans ">
                {/* Colonne Gauche : Liste */}
                <div className={`${showMobileChat ? 'hidden' : 'flex'} md:flex w-full lg:max-w-sm md:max-w-[200px] mx-auto flex-shrink-0 h-full`}>
                    <ChatList onSelectContact={handleSelect} selectedId={selectedContact?.id} />
                </div>

                {/* Colonne Centrale : Fenêtre de Chat */}
                <div className={`${showMobileChat ? 'flex' : 'hidden'} md:flex  w-full md:max-w-[510px] lg:max-w-md  mx-auto h-full`}>
                    <ChatWindow contact={selectedContact} onBack={() => setShowMobileChat(false)} />
                </div>
            </div>
        </ModalCard>
    )
}