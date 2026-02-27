import React, { useRef, useMemo } from 'react';
import { ModalCard } from '../../ui/ModalCard';
import { Button } from '../../ui/Button';
import { CountItems } from '../global/CountItems';
import { MessageCard } from '../../ui/MessageCustomerCard';
import { Trash2, Loader2 } from 'lucide-react';
import { useGetContactSend } from '../../hooks/useContact';

export function Messagecustomer({ closeMessage, onConfirmation }) {
    const scrollRef = useRef(null);

    // 1. Récupération des données réelles
    const { data: contactResponse, isLoading } = useGetContactSend();

    // 2. Extraction et formatage des données
    const contactsList = useMemo(() => {
        return contactResponse?.data?.contacts || [];
    }, [contactResponse]);

    const totalItems = contactResponse?.data?.pagination?.totalItems || 0;

    // 3. Transformation pour le composant MessageCard
    const formattedMessages = useMemo(() => {
        return contactsList.map((contact) => {
            const dateObj = new Date(contact.createdAt);
            return {
                id: contact.id,
                businessName: contact.provider?.businessName || 'Prestataire',
                // On utilise la photo du profil si elle existe, sinon une image par défaut
                image: contact.provider?.user?.profilePhoto || `https://ui-avatars.com/api/?name=${contact.provider?.businessName}&background=random`,
                date: dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
                time: dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                displayId: contact.id.substring(0, 8), // Petit ID visuel
                message: contact.message,
                status: contact.status, // 'pending', etc.
            };
        });
    }, [contactsList]);

    return (
        <ModalCard
            title="Messages envoyés"
            closeModal={closeMessage}
            isWide={true}
        >
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    <p className="text-sm text-gray-500">Chargement de vos messages...</p>
                </div>
            ) : (
                <>
                    <CountItems count={totalItems} scrollContainerRef={scrollRef} />

                    <div
                        ref={scrollRef}
                        className="flex flex-col gap-4 overflow-y-auto h-full pb-5 md:pb-10 no-scrollbar"
                    >
                        {formattedMessages.length > 0 ? (
                            formattedMessages.map((msg, index) => (
                                <div key={msg.id} data-index={index} className="flex-shrink-0">
                                    <MessageCard
                                        {...msg}
                                        // actions={
                                        //     <Button
                                        //         variant="secondary"
                                        //         className="text-red-400 hover:text-red-600 hover:bg-red-50 !p-2 !rounded-full border-0"
                                        //         onClick={() => onConfirmation(msg.id)}
                                        //         aria-label="Supprimer"
                                        //     >
                                        //         <Trash2 className="w-4 h-4" />
                                        //     </Button>
                                        // }
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-500 italic">
                                Aucun message envoyé pour le moment.
                            </div>
                        )}
                    </div>
                </>
            )}
        </ModalCard>
    );
}