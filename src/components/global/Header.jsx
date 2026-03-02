import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Ajout de useNavigate
import { Search, Bell, Menu, X } from 'lucide-react'; // Ajout de X pour effacer
import { Button } from '../../ui/Button';

export function Header({ onMenuClick, filters, setFilters }) {
    const location = useLocation();
    const navigate = useNavigate();
    const pathname = location.pathname;

    // État local pour l'input (pour un contrôle fluide)
    const [query, setQuery] = useState(filters?.search || "");

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

    // LOGIQUE DE RECHERCHE
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        // Met à jour les filtres globaux
        setFilters(prev => ({ ...prev, search: value }));

        // Redirection vers 'feature' si on tape quelque chose (sauf si on y est déjà)
        if (value.length > 0 && pathname !== '/feature') {
            navigate('/feature');
        }
    };

    const clearSearch = () => {
        setQuery("");
        setFilters(prev => ({ ...prev, search: "" }));
    };

    return (
        <header className="p-4 lg:p-8 z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-4">
                    <Button
                        variant="secondary"
                        size={false}
                        onClick={onMenuClick}
                        className="lg:hidden relative p-2.5 shadow-sm h-fit"
                    >
                        <Menu className="w-6 h-6 text-gray-500" />
                    </Button>
                    <div>
                        <h1 className="text-xl md:text-2xl text-gray-700 font-bold lg:pacifico-regular">{title}</h1>
                        <p className="text-sm text-gray-500">{subtitle}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative w-full block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={query} // Input contrôlé
                            onChange={handleSearchChange} // Appel de la fonction
                            placeholder="Rechercher..."
                            className="pl-10 pr-10 py-[10px] rounded-md bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#FCE0D6] focus:border-transparent w-full md:w-64 shadow-sm border border-gray-100"
                        />
                        {/* Bouton pour effacer la recherche si non vide */}
                        {query.length > 0 && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size={false}
                            className="relative p-2.5 shadow-sm"
                        >
                            <Bell className="w-5 h-5 text-gray-500" />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}