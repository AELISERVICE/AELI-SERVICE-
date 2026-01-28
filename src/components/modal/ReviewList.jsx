import React, { useState, useRef, useEffect } from 'react'
import { ReviewCard } from '../../ui/ReviewCard'
import { ModalCard } from '../../ui/ModalCard'
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
]


export function ReviewList({ closeReview }) {
    const [openMenuId, setOpenMenuId] = useState(null)
    const menuRef = useRef(null)
    const buttonRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target) &&
                buttonRef.current && !buttonRef.current.contains(event.target)) {
                setOpenMenuId(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <ModalCard closeModal={closeReview}>
            <div className="flex flex-col gap-6 overflow-y-auto h-full pb-10 custom-scrollbar">
                {profiles.map((profile) => (
                    <div key={profile.id} className="flex-shrink-0">
                        <ReviewCard
                            {...profile}
                            actions={[
                                <button
                                    ref={openMenuId === profile.id ? buttonRef : null}
                                    onClick={() => setOpenMenuId(openMenuId === profile.id ? null : profile.id)}
                                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-50"
                                >
                                    <MoreHorizontal size={20} />
                                </button>,
                                <ActionMenu
                                    isOpen={openMenuId === profile.id}
                                    onClose={() => setOpenMenuId(null)}
                                    menuRef={openMenuId === profile.id ? menuRef : null}
                                    onEdit={() => console.log("Editer", profile.id)}
                                    onDelete={() => console.log("Supprimer", profile.id)}
                                />
                            ]}
                        />
                    </div>
                ))}
            </div>
        </ModalCard>
    )
}