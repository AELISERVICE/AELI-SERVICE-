import React from 'react'
import { Search, Bell, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function Header({ onOpenMenu }) {
  const navigate = useNavigate()

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div className="w-full flex items-center justify-between gap-4">
        {/* BOUTON BURGER : visible uniquement sur mobile */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bienvenue, Amanda</h1>
          <p className="text-sm text-gray-500 mt-1">Lun, 26 jan 2026</p>
        </div>

        <button
          onClick={onOpenMenu}
          className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-600 md:hidden shadow-sm hover:bg-gray-50"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none shadow-sm"
          />
        </div>

        <button className="p-2.5 bg-white border border-gray-100 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors shadow-sm relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div
          onClick={() => navigate("/profile")}>
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
            alt="Profile"
            className="w-10 h-10 rounded-xl object-cover border-2 border-white shadow-sm"
          />
        </div>

      </div>
    </header>
  )
}
