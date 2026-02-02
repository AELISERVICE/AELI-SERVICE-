import React from 'react'
import { Heart, MapPin, Star, Coins } from 'lucide-react'
import { Button } from './Button' // Vérifie le chemin d'importation

export function ProductCard({
  title,
  name,
  description,
  role,
  image,
  likes,
  location,
  rating,
  price,
  isAdmin = false,
  showMenu = false,
  isStructure = false,
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
          {!isStructure &&
            <p className="flex text-sm text-gray-200 line-clamp-2 leading-relaxed opacity-90 items-center gap-2">
              <Coins color="gold" size={20} />
              {price} Fcfa
            </p>
          }
          {isStructure &&
            <>
              <p className="flex text-sm text-gray-200 line-clamp-2 leading-relaxed opacity-90 items-center gap-2">
                <MapPin className="text-white" size={16} />
                {location}
              </p>
              <p className="flex text-sm text-gray-200 line-clamp-2 leading-relaxed opacity-90 items-center gap-2">
                <Star className=" fill-yellow-400 text-yellow-400" size={16} />
                {rating}
              </p>
            </>
          }

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Heart className="fill-white text-white" size={16} onClick={onFeedback} />
              <span className="text-sm font-medium">{likes}</span>
            </div>

            {actions && actions[0]}
            {actions && actions[1]}
          </div>
        </div>
      </div>
    </div>
  )
}