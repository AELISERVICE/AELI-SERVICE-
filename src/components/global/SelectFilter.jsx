import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown, Star } from 'lucide-react';

// Ajout de customIcon dans les props
export const SelectFilter = ({ options, value, onChange, label = "Secteur", className, classNameButon, customIcon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        /* On utilise la className passée en prop ici */
        <div className={`relative inline-block ${className}`} ref={containerRef}>
            {/* Ajout de w-full sur le bouton pour qu'il s'étire selon le parent */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full gap-3 bg-white h-[46px] px-4 rounded-xl  transition-all duration-200 
                    ${classNameButon}`}
            >
                <div className="flex items-center gap-2">
                    {/* Icône dynamique : customIcon ou Filter par défaut */}
                    {customIcon ? customIcon : <Filter size={18} className="text-purple-500" />}

                    <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                        {value === 'All' || value === 'Tout' ? `Tous les ${label}s` : value}
                    </span>
                </div>

                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Liste Déroulante - On la force à faire au moins la largeur du bouton */}
            {isOpen && (
                <div className="absolute left-0 md:right-0 mt-2 min-w-full bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-1.5">
                        <button
                            onClick={() => { onChange('Tout'); setIsOpen(false); }}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors
                            ${value === 'Tout' ? 'bg-red-50 text-[#E8524D] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Toutes les {label}s
                        </button>

                        <div className="h-px bg-gray-100 my-1 mx-2" />

                        {options.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => { onChange(opt); setIsOpen(false); }}
                                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors
                                ${value === opt ? 'bg-red-50 text-[#E8524D] font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};