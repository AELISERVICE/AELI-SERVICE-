import React from 'react'
import { MessageCard } from '../../ui/messageCustomerCard'

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
]

export function Messagecustomer({ closeMessage }) {
    return (
        <div
            onClick={() => closeMessage()}
            className="fixed w-full bg-black/60 backdrop-blur-sm h-screen flex flex-col z-20 ">
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full lg:w-[60%] xl:w-[55%] h-full flex flex-col bg-[#FAFAFB] px-4 overflow-hidden">
                <header className="py-8 md:py-10 flex-shrink-0">
                    <h1 className="text-3xl font-bold text-[#0F172A]">Messages</h1>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] flex-1 min-h-0">
                    <div className="flex flex-col gap-2 p-4 justify-center items-center">
                        <div className="w-1.5 h-12 bg-purple-200 rounded-full"></div>
                        <div className="w-1.5 h-12 bg-purple-700 rounded-full"></div>
                        <div className="w-1.5 h-12 bg-purple-200 rounded-full"></div>
                        <div className="w-1.5 h-12 bg-purple-200 rounded-full"></div>
                    </div>
                    <div className="flex flex-col gap-4 overflow-y-auto h-full pr-2">
                        {MOCK_DATA.map((msg) => (
                            <MessageCard key={msg.id} {...msg} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
