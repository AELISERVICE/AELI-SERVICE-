import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Trash2, Eye, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button } from '../../ui/Button';


export function ActionMenu({ isOpen, onClose, triggerRef, onEdit, onDelete, onStatusChange, initialStatus = false }) {
    const menuRef = useRef(null);
    const location = useLocation();
    const isUsers = location.pathname.startsWith('/users');

    // État local pour l'animation du switch
    const [isBlocked, setIsBlocked] = useState(initialStatus);

    // IMPORTANT : Synchronise le switch quand on ouvre le menu
    useEffect(() => {
        if (isOpen) {
            setIsBlocked(initialStatus);
        }
    }, [isOpen, initialStatus]);

    const handleToggle = (e) => {
        e.stopPropagation();
        // On informe le parent qu'il faut changer le statut
        onStatusChange?.();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            ref={menuRef}
            className="absolute bottom-10 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 w-48 z-20 animate-in fade-in zoom-in-95 duration-200 origin-bottom-right overflow-hidden"
        >
            <div className="flex flex-col">
                {!isUsers &&
                    <div className="border-b border-gray-100 hover:bg-gray-50">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full gap-3 px-4 py-3.5 text-xs font-bold justify-start text-zinc-600"
                            onClick={() => { onEdit?.(); onClose(); }}
                        >
                            <Eye size={16} />
                            <span>Consulter</span>
                        </Button>
                    </div>
                }
                {/* --- OPTION : BLOQUER (SWITCH) --- */}
                {/* --- OPTION : BLOQUER (SWITCH) --- */}
                <div
                    className="flex items-center justify-between px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer group"
                    onClick={handleToggle}
                >
                    <div className="flex items-center gap-3">
                        {isBlocked
                            ? <ShieldAlert size={16} className="text-rose-600" />
                            : <ShieldCheck size={16} className="text-emerald-600" />
                        }
                        <span className={`text-xs font-bold ${isBlocked ? 'text-rose-600' : 'text-zinc-600'}`}>
                            {isBlocked ? 'Débloquer' : 'Bloquer'}
                        </span>
                    </div>

                    {/* Le Switch : Rouge si bloqué, Gris si actif */}
                    <div className={`
                        relative w-8 h-4.5 rounded-full transition-colors duration-300
                        ${isBlocked ? 'bg-rose-600' : 'bg-zinc-200'}
                    `}>
                        <div className={`
                            absolute top-[2px] left-[2px] bg-white w-3.5 h-3.5 rounded-full transition-transform duration-300 shadow-sm
                            ${isBlocked ? 'translate-x-[14px]' : 'translate-x-0'}
                        `} />
                    </div>
                </div>
                <div className="hover:bg-red-50">
                    <Button
                        variant="ghostDanger"
                        size="sm"
                        className="w-full gap-3 px-4 py-3.5 text-xs font-bold justify-start"
                        onClick={() => { onDelete?.(); onClose(); }}
                    >
                        <Trash2 size={16} />
                        <span>Supprimer</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}