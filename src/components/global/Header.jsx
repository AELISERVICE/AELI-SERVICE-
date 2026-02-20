import React from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';
import { Button } from '../../ui/Button';

export function Header({ onMenuClick }) {

    const location = useLocation();
    const pathname = location.pathname;

    const getHeaderContent = () => {
        if (pathname.startsWith('/dashboard')) {
            return { title: "Tableau de bord", subtitle: "Vue d'ensemble de votre activité" };
        }
        if (pathname.startsWith('/provider')) {
            return { title: "Gestion des Prestataires", subtitle: "Gérez vos salons et professionnels enregistrés" };
        }
        if (pathname.startsWith('/subscriptions')) {
            return { title: "Abonnements", subtitle: "Suivi des paiements et des formules" };
        }
        if (pathname.startsWith('/feature')) {
            return { title: "Mise en avant", subtitle: "Gérez la visibilité des services" };
        }
        if (pathname.startsWith('/users')) {
            return { title: "Gestion des Utilisateurs", subtitle: "Liste et gestion des comptes clients" };
        }
        if (pathname.startsWith('/moderation')) {
            return { title: "Modération", subtitle: "Contrôle des avis et contenus signalés" };
        }
        if (pathname.startsWith('/security')) {
            return { title: "Sécurité", subtitle: "Paramètres d'accès et logs système" };
        }
        return { title: "Administration", subtitle: "Bienvenue sur votre espace de gestion" };
    };
    const { title, subtitle } = getHeaderContent();

    return (
        <header className=" p-4 lg:p-8 z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex  gap-4">
                    <Button
                        variant="secondary"
                        size={false}
                        onClick={onMenuClick}
                        className=" lg:hidden relative p-2.5 shadow-sm h-fit "
                    >
                        <Menu className="w-6 h-6 text-gray-500" />
                    </Button>
                    <div>

                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl text-gray-700 font-bold lg:pacifico-regular">{title}</h1>
                        <p >{subtitle}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative  w-full block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Type here..."
                            className="pl-10 pr-4 py-[10px] rounded-md bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#FCE0D6] focus:border-transparent w-full md:w-64 shadow-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size={false}
                            className="relative p-2.5 shadow-sm "
                        >
                            <Bell className="w-5 h-5 text-gray-500" />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </Button>
                    </div>
                </div>
            </div>
        </header >
    )
}
