import React, { useState } from 'react'
import { Search, Bell, Menu, Star, Coins, X, ChevronDown } from 'lucide-react'
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom'
import { SelectFilter } from './SelectFilter' // Assure-toi du chemin

export function Header({ onOpenMenu, openSidebar }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isSearchPage = location.pathname === '/search'
  const [query, setQuery] = useState("")

  // État pour la notation
  const [rating, setRating] = useState('Tout')

  const handleSearchChange = (e) => {
    const value = e.target.value
    setQuery(value)
    if (value.length > 0 && location.pathname !== '/search') {
      navigate('/search', { state: { initialQuery: value } })
    }
  }

  const isExpanded = query.length > 0
  const showFilters = isExpanded || isSearchPage;

  return (
    <header className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
      {/* Logo & Burger Mobile */}
      <div className="w-full flex items-center justify-between gap-4 md:hidden">
        <div className="flex items-center gap-3">
          <img src='./aelilogo.svg' alt='logo' className="w-10 h-10 flex-shrink-0" />
          <span className="font-bold text-xl pacifico-regular">AELI Services</span>
        </div>
        <button onClick={onOpenMenu} className="p-2.5 bg-white rounded-xl text-gray-600 shadow-sm">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Titre Bienvenue */}
      <div className={`w-full flex items-center justify-between gap-4  ${openSidebar ? "flex" : "md:hidden lg:flex"}`}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenue, <span className="text-[#E8524D] pacifico-regular text-3xl"> Amanda</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Lun, 26 jan 2026</p>
        </div>
      </div>

      <div className="relative flex w-auto items-center justify-end gap-4">
        <div className="flex w-full flex-col gap-4">
          {/* BARRE DE RECHERCHE */}
          <div className={`relative transition-all duration-500 w-full md:w-80`}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={handleSearchChange}
              autoFocus={isSearchPage}
              placeholder="Rechercher un service..."
              className="w-full pl-10 pr-10 py-2.5 bg-white md:border md:border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-[#FCE0D6] outline-none md:shadow-sm"
            />
            {isExpanded && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* FILTRES DYNAMIQUES (Positionnés en absolute sous la barre) */}
          <div className={`absolute top-14 right-0 left-0 w-full items-center gap-2 transition-all duration-500  ${showFilters ? 'flex opacity-100 translate-y-0' : 'hidden opacity-0 -translate-y-2 pointer-events-none'} z-2`}>

            {/* Input Prix */}
            <div className="flex flex-1 items-center gap-2 bg-white md:border md:border-gray-100 px-3 rounded-xl md:shadow-sm hover:border-[#E8524D] transition-colors">
              <Coins color="gold" size={18} />
              <input
                type="number"
                placeholder="Prix Max"
                className="w-full outline-none text-[11px] font-medium bg-transparent py-3"
              />
            </div>

            {/* Ton UI SelectFilter adapté pour la Note */}
            <div className="flex-1">
              <SelectFilter
                label="Note"
                options={['4.0+', '4.5+', '5.0']}
                value={rating}
                onChange={setRating}
                className="w-full border-none shadow-none"
                classNameButon="md:shadow-sm"
                // On passe une version customisée si tu veux changer l'icône de base Filter par Star
                customIcon={<Star size={16} className="text-yellow-400 fill-yellow-400" />}
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <button className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-500 hover:bg-gray-50 shadow-sm relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Profil */}
        <div onClick={() => navigate("/profile")} className='w-14 cursor-pointer'>
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
            alt="Profile"
            className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm hover:scale-105 transition-transform"
          />
        </div>
      </div>
    </header>
  )
}