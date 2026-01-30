import React, { useState, useRef, useEffect } from 'react'
import { ReviewCard } from '../../ui/ReviewCard'
import { ModalCard } from '../../ui/ModalCard'
import { CountItems } from '../global/CountItems'
import { ActionMenu } from '../global/ActionMenu'
import { MoreHorizontal } from 'lucide-react'

const profiles = [
    {
        id: '1',
        name: 'Emily Jeff',
        role: 'CEO',
        company: 'TheWebagency',
        imageUrl:
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
        testimonial:
            'Terminated principles sentiments of no piano. Projection impossible of no is. Reasoned as list.',
        rating: 5,
    },
    {
        id: '2',
        name: 'Hamza Malik',
        role: 'Manager',
        company: 'TheWekrtech',
        imageUrl:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
        testimonial:
            'Can how elinor warmly mrs basket marked. Led raising expense yet demesne weather musical. Me mr what.',
        rating: 5,
    },
    {
        id: '3',
        name: 'Elizabeth Rai',
        role: 'Developer',
        company: 'I2c Company',
        imageUrl:
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
        testimonial:
            'Whatever boy her exertion his extended. Ecstatic followed handsome drawings entirely mrs one yet.',
        rating: 4,
    },
    {
        id: '3',
        name: 'Elizabeth Rai',
        role: 'Developer',
        company: 'I2c Company',
        imageUrl:
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
        testimonial:
            'Whatever boy her exertion his extended. Ecstatic followed handsome drawings entirely mrs one yet.',
        rating: 4,
    },
    {
        id: '3',
        name: 'Elizabeth Rai',
        role: 'Developer',
        company: 'I2c Company',
        imageUrl:
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
        testimonial:
            'Whatever boy her exertion his extended. Ecstatic followed handsome drawings entirely mrs one yet.',
        rating: 4,
    },
]


export function ReviewList({ closeReview }) {
    const scrollRef = useRef(null)
    const [openMenuId, setOpenMenuId] = useState(null)
    const triggerRef = useRef(null)

    return (
        <ModalCard title="Avis" closeModal={closeReview}>
            {/* On passe la ref du conteneur */}
            <CountItems count={profiles.length} scrollContainerRef={scrollRef} />

            <div
                ref={scrollRef}
                className="flex-1 flex flex-col gap-6 overflow-y-auto h-full pb-10 no-scrollbar scroll-smooth"
            >
                {profiles.map((profile, index) => (
                    <div
                        key={profile.id}
                        data-index={index} // INDISPENSABLE pour l'observer
                        className="relative flex-shrink-0"
                    >
                        <ReviewCard
                            {...profile}
                            actions={[
                                <button
                                    key="trigger"
                                    ref={openMenuId === profile.id ? triggerRef : null}
                                    onClick={() => setOpenMenuId(openMenuId === profile.id ? null : profile.id)}
                                    className="p-1"
                                >
                                    <MoreHorizontal size={20} />
                                </button>,
                                <ActionMenu
                                    isOpen={openMenuId === profile.id}
                                    onClose={() => setOpenMenuId(null)}
                                    triggerRef={triggerRef}
                                    onEdit={() => console.log("Edit", profile.id)}
                                    onDelete={() => console.log("Delete", profile.id)}
                                />
                            ]}
                        />
                    </div>
                ))}
            </div>
        </ModalCard>
    )
}