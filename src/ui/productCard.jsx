import React from 'react';
import {
  Star,
  MapPin,
  Calendar,
  Clock,
  Heart
} from 'lucide-react';
import { useCheckFavorites } from '../hooks/useFavorites';

export function ProductCard({
  id,
  title,
  name,
  description,
  role,
  image,
  isAdmin,
  location,
  createdAt,
  rating,
  price,
  isStructure = false,
  onFavorite,
  actions,
  isShowFavorie = true
}) {
  const displayTitle = title || name;
  const displaySub = description || role;

  const { data: checkData } = useCheckFavorites(id);
  const isFavorite = checkData?.data?.isFavorite;

  return (
    <div className="bg-[#f3f3f3] p-2.5 rounded-[24px] w-full shadow-sm group">
      {/* --- CARTE BLANCHE INTERNE --- */}
      <div className="bg-white rounded-[20px] overflow-hidden flex flex-col border border-gray-100 relative">

        {/* 1. VISUEL (Image avec bouton Favori/Admin) */}
        <div className="relative w-full aspect-[1.3/1] overflow-hidden">
          <img
            src={image || `./defaultstructure.jpg`}
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
          <div className="absolute -bottom-20 -right-20 w-64 h-40 bg-purple-600 rounded-full blur-[100px] opacity-20 z-0"></div>


          {/* Bouton Favori (Star Style) */}
          {isShowFavorie && (
            <button
              onClick={(e) => { e.stopPropagation(); onFavorite(); }}
              className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-sm hover:scale-110 transition-transform z-20"
            >
              <Star
                size={18}
                className={`${isFavorite ? "fill-yellow-400  text-yellow-400 " : "text-gray-400"}`}
              />
            </button>
          )}

          {/* Menu Admin si applicable */}
          {isAdmin && (
            <div className="absolute top-3 right-3 z-20">
              {actions[0]} {actions[1]}
            </div>
          )}
        </div>

        {/* 2. CONTENU TEXTUEL */}
        <div className="p-4 flex flex-col gap-3">

          {/* Titre et Note */}
          <div className="flex justify-between items-start">
            <div className={`flex flex-col   ${isStructure ? "max-w-[70%]" : "max-w-[100%]"}`}>
              <h3 className="text-[16px] font-bold text-gray-900 leading-tight truncate">
                {displayTitle}
              </h3>
              <p className={`text-[12px] text-gray-400 font-medium italic ${isStructure ? "truncate" : ""}`}>
                {isStructure ? displaySub : displaySub}
              </p>
            </div>

            {/* Rating */}
            {isShowFavorie &&
              <div className="flex items-center gap-1">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                <span className="text-[13px] font-bold text-gray-700">{rating || '0.0'}/5</span>
              </div>
            }
          </div>

          {/* LISTE D'INFOS (Icônes grises style "House Painting") */}
          <div className="flex flex-col gap-2 mt-1">
            {isShowFavorie &&
              <>
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={15} className="shrink-0" />
                  <span className="text-[12px] font-medium text-gray-500">
                    {isStructure ? "Available now" : "Joined Mar 2026"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin size={15} className="shrink-0" />
                  <span className="text-[12px] font-medium text-gray-500 truncate">
                    {location || 'Location non définie'}
                  </span>
                </div>
              </>
            }
            <div className="flex items-center gap-2 text-gray-400">
              <Clock size={15} className="shrink-0" />
              <span className="text-[12px] font-medium text-gray-500">
                {createdAt} {(!isStructure) && "jours restants"}
              </span>
            </div>
          </div>

          {/* 3. FOOTER (PRIX ET ACTIONS) */}
          <div className="flex justify-between items-end mt-3 pt-3 border-t border-gray-50">
            {/* Section Prix */}
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Start from</span>
              {price ? (<div className="flex items-baseline gap-0.5">
                <span className="text-[17px] font-black text-gray-900">
                  {price || '---'}
                </span>
                <span className="text-[12px] font-bold text-gray-900 ml-0.5">FCFA</span>
              </div>) : (
                <span className="text-[12px] font-bold text-gray-900 ml-0.5 italic">disponible</span>
              )}
            </div>

            {/* Bouton d'action (Ton bouton passé en props) */}
            <div className="flex-1 flex justify-end">
              {(isStructure || !isAdmin) && (
                <div className="w-full flex justify-end">
                  {/* On injecte ici ton bouton 'actions[0]' mais il faudra 
                        s'assurer que sa classe CSS interne est un bouton orange 
                        pour matcher totalement le visuel */}
                  {actions[0]}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}