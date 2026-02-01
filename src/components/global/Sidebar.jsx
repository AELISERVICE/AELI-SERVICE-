import React, { useState } from 'react' // Ajout de useState
import { useTheme } from 'next-themes'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Star, Mail, LogOut, Store, Search, MessageSquare, X,
  ChevronRight, ChevronLeft // Nouvelles icônes pour le toggle
} from 'lucide-react'
import { Button } from '../../ui/Button'

export function Sidebar({ onOpenMessage, onOpenFavorite, onOpenReview, activeModal, MODALS, isOpen, onClose, closeModal }) {
  const location = useLocation()
  const navigate = useNavigate()

  // État pour gérer l'agrandissement sur ordinateur
  const [isCollapsed, setIsCollapsed] = useState(true)

  const navLinks = [
    { icon: LayoutDashboard, path: '/home', label: 'Accueil' },
    { icon: Search, path: '/search', label: 'Recherche' },
    { icon: Store, path: '/provider', label: 'Prestataires' },
  ]

  return (
    <>
      {/* Overlay Mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed md:sticky left-0 top-0 h-screen z-40
        flex flex-col py-8 bg-white border-r border-gray-100
        transition-all duration-300 ease-in-out 
        
        /* Gestion Largeur : Mobile toujours large (w-64). Desktop varie selon isCollapsed */
        w-70 ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>

        {/* Bouton Toggle Desktop (Caché sur mobile) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-10 bg-[#E8524D] border border-gray-100 rounded-full p-2 shadow-sm hover:text-purple-600 transition-colors z-50 "
        >
          {isCollapsed ? <ChevronRight size={16} className="text-white" /> : <ChevronLeft size={16} className="text-white" />}
        </button>

        {/* Header : Logo + Titre */}
        <div className={`flex items-center justify-between w-full px-6 mb-12 ${isCollapsed ? 'md:justify-center md:px-0' : 'md:justify-start md:px-6'}`}>
          <div className="flex items-center gap-3">
            <img src='./aelilogo.svg' alt='logo' className="w-10 h-10 flex-shrink-0" />
            {/* Texte affiché si mobile OU si desktop n'est pas réduit */}
            <span className={`font-bold text-xl  md:transition-opacity pacifico-regular ${isCollapsed ? 'md:hidden' : 'md:block'}`}>
              AELI Service
            </span>
          </div>
          <Button
            variant="close"
            size="none"
            isCircle={true}
            onClick={onClose}
            className="md:hidden p-2 text-gray-400"
            aria-label="Fermer"
          >
            <X size={24} />
          </Button>
        </div>

        <nav className="flex-1 flex flex-col gap-4 w-full px-4">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path
            return (
              <button
                key={link.path}
                onClick={() => { navigate(link.path); onClose(); closeModal(); }}
                className={`p-3 rounded-xl transition-all duration-200 group relative flex items-center gap-4
                  ${isCollapsed ? 'md:justify-center' : 'md:justify-start'}
                  ${isActive ? 'bg-purple-50 text-[#E8524D] shadow-sm' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}
                `}
              >
                <link.icon className="w-5 h-5 flex-shrink-0" />
                <span className={`text-sm font-semibold truncate ${isCollapsed ? 'md:hidden' : 'md:block'}`}>
                  {link.label}
                </span>

                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#E8524D] rounded-r-full -ml-4" />
                )}
              </button>
            )
          })}

          <div className="w-full h-px bg-gray-100 " />

          {/* Boutons Modales */}
          {[
            { icon: Mail, label: 'Messages', onClick: onOpenMessage, id: MODALS.MESSAGE },
            { icon: MessageSquare, label: 'Avis', onClick: onOpenReview, id: MODALS.REVIEW },
            { icon: Star, label: 'Favoris', onClick: onOpenFavorite, id: MODALS.FAVORITE }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={item.onClick}
              className={`p-3 rounded-xl transition-all duration-200 flex items-center gap-4
                ${isCollapsed ? 'md:justify-center' : 'md:justify-start'}
                ${activeModal === item.id ? 'bg-purple-50 text-[#E8524D] shadow-sm' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}
              `}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className={`text-sm font-semibold truncate ${isCollapsed ? 'md:hidden' : 'md:block'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="flex flex-col gap-6 w-full px-4 mt-auto">
          <div className="w-full h-px bg-gray-100" />
          <button onClick={() => navigate('/login')} className={`p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-4 ${isCollapsed ? 'md:justify-center' : 'md:justify-start'}`}>
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={`text-sm font-semibold truncate ${isCollapsed ? 'md:hidden' : 'md:block'}`}>
              Déconnexion
            </span>
          </button>


        </div>
      </aside>
    </>
  )
}