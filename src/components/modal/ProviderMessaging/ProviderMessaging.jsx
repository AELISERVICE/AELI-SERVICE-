import { useState, useMemo } from 'react'
import { ChatList } from './ChatList'
import { ChatWindow } from './ChatWindow'
import { ModalCard } from '../../../ui/ModalCard'
import { useGetReceivedContact } from '../../../hooks/useContact'

export function ProviderMessaging({ closeMessaging }) {
    const { data: dataRecivedContact, isLoading } = useGetReceivedContact();
    const [selectedId, setSelectedId] = useState(null);
    const [showMobileChat, setShowMobileChat] = useState(false);

    const chatGroups = useMemo(() => {
        const rawContacts = dataRecivedContact?.data?.contacts || [];
        const groups = {};

        rawContacts.forEach(contact => {
            const email = contact.senderEmail;
            if (!groups[email]) {
                groups[email] = {
                    id: email,
                    name: `${contact.sender?.firstName} ${contact.sender?.lastName}` || contact.senderName,
                    avatar: contact.sender?.profilePhoto,
                    isOnline: true,
                    messages: [] 
                };
            }
            groups[email].messages.push({
                id: contact.id,
                text: contact.message,
                timestamp: new Date(contact.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                isUnlocked: contact.isUnlocked, // On remonte l'info ici
                fullData: contact 
            });
        });

        return Object.values(groups);
    }, [dataRecivedContact]);

    useMemo(() => {
        if (chatGroups.length > 0 && !selectedId) {
            setSelectedId(chatGroups[0].id);
        }
    }, [chatGroups, selectedId]);

    const selectedChat = chatGroups.find(c => c.id === selectedId);

    return (
        <ModalCard title={'Messages clients'} closeModal={closeMessaging} isWide={true}>
            {isLoading ? (
                <div className="h-[450px] flex items-center justify-center font-medium text-gray-500">Chargement...</div>
            ) : (
                <div className="flex overflow-hidden font-sans h-[500px]">
                    <div className={`${showMobileChat ? 'hidden' : 'flex'} md:flex w-full lg:max-w-sm md:max-w-[250px] flex-shrink-0 h-full border-r border-gray-100`}>
                        <ChatList 
                            contacts={chatGroups.map(group => ({
                                ...group,
                                lastMessage: group.messages[0].text,
                                lastMessageTime: group.messages[0].timestamp
                            }))} 
                            onSelectContact={(c) => { setSelectedId(c.id); setShowMobileChat(true); }} 
                            selectedId={selectedId} 
                        />
                    </div>
                    <div className={`${showMobileChat ? 'flex' : 'hidden'} md:flex flex-1 h-full bg-gray-50/30`}>
                        <ChatWindow 
                            chat={selectedChat} 
                            onBack={() => setShowMobileChat(false)} 
                        />
                    </div>
                </div>
            )}
        </ModalCard>
    )
}