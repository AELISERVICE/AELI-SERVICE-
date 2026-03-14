import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../ui/Button';
import { DashboardIcon, SearchIcon, StoreIcon, MailIcon, StarIcon } from './Sidebar';
import { useInfoUserConnected } from '../../hooks/useUser';

/**
 * UI component responsible for rendering bottom tab (mobile).
 */
export function BottomTab({ onOpenMessage, onOpenFavorite, activeModal, MODALS, closeModal, isLoading }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { data: userData } = useInfoUserConnected();
    const user = userData?.data?.user;

    const navLinks = [
        { icon: DashboardIcon, path: '/home', label: 'Accueil' },
        { icon: SearchIcon, path: '/search', label: 'Recherche' },
        user?.role === 'provider' && { icon: StoreIcon, path: '/provider', label: 'Prestataires' },
    ].filter(Boolean);

    const actionLinks = [
        { icon: MailIcon, label: 'Messages', onClick: onOpenMessage, id: MODALS.MESSAGE },
        { icon: StarIcon, label: 'Favoris', onClick: onOpenFavorite, id: MODALS.FAVORITE },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
            <div className="bg-white/95 backdrop-blur border-t border-slate-100 shadow-[0_-8px_24px_-16px_rgba(15,23,42,0.2)]">
                <div className="grid grid-cols-5 gap-1 px-2 py-2">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <button
                                key={link.path}
                                onClick={() => { navigate(link.path); closeModal(); }}
                                className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-semibold transition-colors
                                    ${isActive ? 'text-[#E8524D] bg-purple-50' : 'text-slate-400 hover:text-slate-600'}
                                `}
                            >
                                <link.icon className="w-5 h-5" />
                                <span className="truncate">{link.label}</span>
                            </button>
                        );
                    })}

                    {actionLinks.map((item) => (
                        <Button
                            key={item.label}
                            type="button"
                            size="none"
                            variant="ghost"
                            disabled={isLoading}
                            onClick={item.onClick}
                            className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-semibold transition-colors
                                ${activeModal === item.id ? 'text-[#E8524D] bg-purple-50' : 'text-slate-400 hover:text-slate-600'}
                            `}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="truncate">{item.label}</span>
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}
