import React from 'react'
import { Heart, MoreHorizontal, Edit2, Trash2 } from 'lucide-react'

export function ProductCard({
  title,
  name,        // Supporte les deux noms de props
  description,
  role,        // Supporte les deux noms de props
  image,
  likes,
  isAdmin = false, // Par défaut, mode utilisateur normal
  showMenu = false,
  onContact
}) {
  // On harmonise les noms pour que ça marche avec tes deux listes d'objets
  const displayTitle = title || name
  const displaySub = description || role

  return (
    <div className={`group relative transition-all duration-300 bg-white rounded-[2rem] p-3 shadow-sm hover:shadow-xl`}>

      {/* Conteneur Image */}
      <div className={'relative aspect-[4/5] rounded-[1.5rem] overflow-hidden mb-4'}>
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
              <Heart className="fill-white text-white" size={16} />
              <span className="text-sm font-medium">{likes}</span>
            </div>

            {isAdmin ? (
              <button className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <MoreHorizontal size={20} />
              </button>
            ) : (
              <button
                onClick={onContact}
                className="rounded-full bg-fuchsia-600 px-6 py-2 text-sm font-medium hover:bg-fuchsia-500">
                Contacter
              </button>
            )}
          </div>
        </div>

        {/* Menu Admin */}
        {isAdmin && showMenu && (
          <div className="absolute bottom-16 left-4 bg-white rounded-xl shadow-xl p-2 w-32 z-30">
            <button className="flex items-center gap-2 w-full p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
              <Edit2 size={14} /> Modifier
            </button>
            <button className="flex items-center gap-2 w-full p-2 text-sm text-red-500 hover:bg-red-50 rounded-lg">
              <Trash2 size={14} /> Supprimer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}