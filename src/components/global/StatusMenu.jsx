import React, { useEffect, useRef, useState } from 'react'
import { CheckCircle2, MessageSquare, Clock, ShieldAlert } from 'lucide-react'
import { Button } from '../../ui/Button'
import { Portal } from '../../ui/Portal'

export function StatusMenu({ isOpen, onClose, triggerRef, onUpdateStatus }) {
    const menuRef = useRef(null)
    const [coords, setCoords] = useState({ top: 0, left: 0 })

    const STATUS_OPTIONS = [
        { id: 'pending', label: 'En attente', icon: Clock, color: 'text-amber-500' },
        { id: 'contacted', label: 'Contacté', icon: MessageSquare, color: 'text-blue-500' },
        { id: 'completed', label: 'Terminé', icon: CheckCircle2, color: 'text-green-500' },
        { id: 'spam', label: 'Spam', icon: ShieldAlert, color: 'text-red-500' },
    ]

    useEffect(() => {
        if (isOpen && triggerRef?.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.top + window.scrollY - 160, // Ajusté pour 4 options
                left: rect.left + window.scrollX - 40
            });
        }
    }, [isOpen, triggerRef]);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target) && !triggerRef.current.contains(e.target)) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen, onClose, triggerRef])

    if (!isOpen) return null

    return (
        <Portal>
            <div
                ref={menuRef}
                style={{ position: 'absolute', top: `${coords.top}px`, left: `${coords.left}px` }}
                className="bg-white rounded-xl shadow-2xl border border-gray-100 w-44 z-[999] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            >
                <div className="flex flex-col">
                    {STATUS_OPTIONS.map((status, index) => (
                        <div key={status.id} className={`${index !== STATUS_OPTIONS.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50`}>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full gap-3 px-4 py-3 text-xs justify-start font-medium"
                                onClick={() => { onUpdateStatus(status.id); onClose(); }}
                            >
                                <status.icon size={16} className={status.color} />
                                <span>{status.label}</span>
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </Portal>
    )
}