import React, { useEffect, useRef } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '../../ui/Button'

export function ActionMenu({ isOpen, onClose, triggerRef, onEdit, onDelete }) {
    const menuRef = useRef(null)

    useEffect(() => {
        if (!isOpen) return;

        function handleClickOutside(event) {
            // Si le clic n'est ni sur le menu, ni sur le bouton qui l'a ouvert
            if (
                menuRef.current && !menuRef.current.contains(event.target) &&
                triggerRef?.current && !triggerRef.current.contains(event.target)
            ) {
                onClose()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen, onClose, triggerRef])

    if (!isOpen) return null

    return (
        <div
            ref={menuRef}
            className="absolute bottom-8 right-0 bg-white rounded-xl shadow-xl border border-gray-100 p-2 w-40 z-20 animate-in fade-in zoom-in-95 duration-200 origin-bottom-right"
        >
            <div className="flex flex-col gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full gap-2 px-3 py-2 text-xs justify-start"
                    onClick={() => { onEdit?.(); onClose(); }}
                >
                    <Pencil size={14} className="text-blue-500" />
                    <span>Modifier</span>
                </Button>
                <Button
                    variant="ghostDanger"
                    size="sm"
                    className="w-full gap-2 px-3 py-2 text-xs justify-start"
                    onClick={() => { onDelete?.(); onClose(); }}
                >
                    <Trash2 size={14} />
                    <span>Supprimer</span>
                </Button>
            </div>
        </div>
    )
}