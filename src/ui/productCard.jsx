import React from 'react'
import { Heart, MoreHorizontal, Edit2, Trash2 } from 'lucide-react'
import { Button } from './Button' // Vérifie le chemin d'importation

export function ProductCard({
  title,
  name,
  description,
  role,
  image,
  likes,
  isAdmin = false,
  showMenu = false,
  onContact,
  onFeedback,
  actions
}) {
  const displayTitle = title || name
  const displaySub = description || role

  return (
    <div className="group relative transition-all duration-300 bg-white rounded-[2rem] p-3 shadow-sm hover:shadow-xl">

      {/* Conteneur Image */}
      <div className="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden mb-4">
        <img
          src={image}
          alt={displayTitle}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />

        {/* Overlay Contenu */}
        <div className="absolute bottom-0 left-0 w-full p-5 text-white">
          <h3 className="text-xl font-bold mb-1">{displayTitle}</h3>
          <p className="text-sm text-gray-200 line-clamp-2 leading-relaxed opacity-90">
            {displaySub}
          </p>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Heart className="fill-white text-white" size={16} onClick={onFeedback} />
              <span className="text-sm font-medium">{likes}</span>
            </div>

            {actions && actions[0]}
          </div>
        </div>

        {/* Menu Admin */}

        {/* {isAdmin && showMenu && (
          <div className="absolute bottom-16 left-4 bg-white rounded-xl shadow-xl p-2 w-36 z-10">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-gray-600 hover:text-purple-600"
            >
              <Edit2 size={14} /> Modifier
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-red-500 hover:bg-red-50"
            >
              <Trash2 size={14} /> Supprimer
            </Button>
          </div>
        )} */}
      </div>
    </div>
  )
}