import React from 'react'
import { useTheme } from 'next-themes'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Star,
  Users,
  Mail,
  LogOut,
  Sun,
  Moon,
  Search,
  MessageSquare
} from 'lucide-react'

export function Sidebar({ onOpenMessage, onOpenFavorite, onOpenReview, activeModal, MODALS }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()

  // Items de navigation classiques
  const navLinks = [
    { icon: LayoutDashboard, path: '/home', label: 'Accueil' },
    { icon: Search, path: '/search', label: 'Recherche' },
    { icon: Users, path: '/provider', label: 'Prestataires' },
  ]

  return (
    <aside className="hidden md:flex flex-col items-center w-20 py-8 bg-white border-r border-gray-100 h-screen sticky left-0 top-0 z-20">
      {/* Logo */}
      <div className="mb-12">
        <div className="w-10 h-10 flex items-center justify-center text-white font-bold shadow-lg">
          <img src='./aelilogo.svg' alt='logo' className="w-full h-full" />
        </div>
      </div>

      {/* Navigation - Gestion par useNavigate */}
      <nav className="flex-1 flex flex-col gap-6 w-full px-4">
        {navLinks.map((link) => {
          // On vérifie si le chemin actuel correspond à l'icône
          const isActive = location.pathname === link.path

          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={`p-3 rounded-xl transition-all duration-200 group relative flex items-center justify-center
                ${isActive ? 'bg-purple-50 text-purple-600 shadow-sm' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}
              `}
            >
              <link.icon className="w-5 h-5" />

              {/* Indicateur visuel actif */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-purple-600 rounded-r-full -ml-4 animate-in fade-in slide-in-from-left-1 duration-300" />
              )}
            </button>
          )
        })}

        <div className="w-full h-px bg-gray-100 my-2" />

        {/* Bouton Messages (Modal) */}
        <button
          onClick={onOpenMessage}
          className={`p-3 rounded-xl text-gray-400 transition-all duration-200 flex items-center justify-center group ${activeModal === MODALS.MESSAGE ? 'bg-purple-50 text-purple-600 shadow-sm' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
        >
          <Mail className="w-5 h-5" />
        </button>

        {/* Bouton Commentaires */}
        <button
          onClick={onOpenReview}
          className={`p-3 rounded-xl text-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center group  ${activeModal === MODALS.REVIEW ? 'bg-purple-50 text-purple-600 shadow-sm' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
        >
          <MessageSquare className="w-5 h-5" />
        </button>

        {/* Bouton Feedback (Modal) */}
        <button
          onClick={onOpenFavorite}
          className={`p-3 rounded-xl text-gray-400  transition-all duration-200 flex items-center justify-center group  ${activeModal === MODALS.FAVORITE ? 'bg-purple-50 text-purple-600 shadow-sm' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
        >
          <Star className="w-5 h-5" />
        </button>
      </nav>

      {/* Footer Sidebar */}
      <div className="flex flex-col gap-6 w-full px-4 mt-auto">
        <button
          onClick={() => navigate('/login')}
          className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors flex items-center justify-center"
        >
          <LogOut className="w-5 h-5" />
        </button>

        <div className="w-full h-px bg-gray-100" />

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1 bg-purple-100 dark:bg-purple-900 rounded-full w-full flex items-center justify-end relative h-8 transition-colors"
        >
          {/* Le petit cercle blanc qui bouge selon le mode */}
          <div className={`absolute w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-300 ${theme === 'dark' ? 'left-7' : 'left-1'}`} />

          <div className="w-7 h-7 rounded-full bg-gray-900 dark:bg-yellow-400 flex items-center justify-center text-white dark:text-gray-900 z-10">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </div>
        </button>
      </div>
    </aside>
  )
}