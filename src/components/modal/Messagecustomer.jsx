import React, { useRef } from 'react'
import { ModalCard } from '../../ui/ModalCard'
import { Button } from '../../ui/Button'
import { ItemsCount } from '../../ui/ItemsCount'
import { MessageCard } from '../../ui/MessageCustomerCard'
import { Trash2 } from 'lucide-react'

const MOCK_DATA = [
    {
        id: '1',
        businessName: 'Salon Marie',
        image:
            'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=200&h=200',
        date: '15 Jan 2026',
        time: '19:30',
        displayId: 'a3f8c2d1',
        message:
            'Bonjour, je voudrais prendre rendez-vous pour une coupe et coloration. Je suis disponible en semaine après 17h. Pourriez-vous me confirmer vos disponibilités ?',
        status: 'pending',
    },
    {
        id: '2',
        businessName: 'Spa Zen Attitude',
        image:
            'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&q=80&w=200&h=200',
        date: '14 Jan 2026',
        time: '14:20',
        displayId: 'b7e9d3f2',
        message:
            'Bonjour, je souhaiterais réserver un massage relaxant pour deux personnes. Avez-vous des disponibilités ce weekend ?',
        status: 'contacted',
    },
    {
        id: '3',
        businessName: 'FitZone Studio',
        image:
            'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=200&h=200',
        date: '13 Jan 2026',
        time: '10:15',
        displayId: 'c4d8a1e5',
        message:
            "Bonjour, je suis intéressé par un abonnement annuel. Pourriez-vous me donner plus d'informations sur vos tarifs et les cours disponibles ?",
        status: 'pending',
    },
    {
        id: '4',
        businessName: 'Nails & Beauty',
        image:
            'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=200&h=200',
        date: '12 Jan 2026',
        time: '16:45',
        displayId: 'e2f5b9c7',
        message:
            "Bonjour, faites-vous des poses de vernis semi-permanent ? Si oui, quel est le tarif ? Merci d'avance.",
        status: 'contacted',
    },
    {
        id: '4',
        businessName: 'Nails & Beauty',
        image:
            'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=200&h=200',
        date: '12 Jan 2026',
        time: '16:45',
        displayId: 'e2f5b9c7',
        message:
            "Bonjour, faites-vous des poses de vernis semi-permanent ? Si oui, quel est le tarif ? Merci d'avance.",
        status: 'contacted',
    },
    {
        id: '4',
        businessName: 'Nails & Beauty',
        image:
            'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=200&h=200',
        date: '12 Jan 2026',
        time: '16:45',
        displayId: 'e2f5b9c7',
        message:
            "Bonjour, faites-vous des poses de vernis semi-permanent ? Si oui, quel est le tarif ? Merci d'avance.",
        status: 'contacted',
    },
    {
        id: '4',
        businessName: 'Nails & Beauty',
        image:
            'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=200&h=200',
        date: '12 Jan 2026',
        time: '16:45',
        displayId: 'e2f5b9c7',
        message:
            "Bonjour, faites-vous des poses de vernis semi-permanent ? Si oui, quel est le tarif ? Merci d'avance.",
        status: 'contacted',
    },
]

export function Messagecustomer({ closeMessage, onConfirmation }) {
    const scrollRef = useRef(null)

    return (
        <ModalCard
            title="Messages"
            closeModal={closeMessage}
            isWide={true}
        >
            <ItemsCount count={MOCK_DATA.length} scrollContainerRef={scrollRef} />
            <div
                ref={scrollRef}
                className="flex flex-col gap-4 overflow-y-auto h-full pr-2 no-scrollbar">
                {MOCK_DATA.map((msg, index) => (
                    <div key={msg.id} data-index={index} className="flex-shrink-0">
                        <MessageCard
                            {...msg}
                            actions={
                                <Button
                                    variant="secondary"
                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 !p-2 !rounded-full border-0"
                                    onClick={onConfirmation}
                                    aria-label="Supprimer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            }
                        />
                    </div>
                ))}
            </div>

        </ModalCard>
    )
}
