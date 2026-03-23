import React from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  MapPin,
  Star,
  Coins,
  MoreHorizontal,
  ChevronRight,
  MessageCircle,
  Send,
  Bookmark
} from 'lucide-react';
import { useCheckFavorites } from '../hooks/useFavorites';

export function ProductCard({
  id,
  title,
  name,
  description,
  role,
  image,
  likes,
  isAdmin,
  location,
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
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col w-full h-fit  group">

      {/* ─── Header Style Instagram ─── */}
      <div className="flex justify-between px-3 py-2.5 bg-white ">
        <div className="flex gap-2.5">
          {isStructure &&
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 to-fuchsia-600 p-[1.5px]">
              <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-gray-200">
                <img
                  src={image || `./defaultstructure.jpg`}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          }
          <div className="flex flex-col">
            <span className={`${isStructure ? "text-[15px] font-semibold " : "text-[17px] font-bold"} text-gray-900 leading-tight `}>
              {displayTitle}

            </span>
            {!isStructure &&
              <span className="text-[13px] font-black text-black  whitespace-nowrap">
                Prix -  {price} <span className="text-[10px] font-bold">FCFA</span>
              </span>
            }
            {!isStructure &&
              <div className=" border-t border-gray-50 ">
                <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2">
                  {displaySub}
                </p>
              </div>}
            <span className="text-[11px] text-gray-500 leading-tight truncate block max-w-[150px]">
              {isStructure && location}
            </span>
          </div>
        </div>
        <div className="relative flex items-start">
          {isAdmin && (
            <>
              {actions[0]} {/* Le bouton trigger */}
              {actions[1]} {/* Le menu contextuel */}
            </>
          )}
        </div>

      </div>


      {/* ─── Visuel Central (Style Oraimo) ─── */}
      <div className="relative w-full aspect-[4/5] overflow-hidden flex flex-col ">

        <img
          src={image || `./defaultstructure.jpg`}
          alt={displayTitle}
          className="w-full h-full object-cover drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
        />
        {/* </motion.div> */}

        {/* Badge Flottant (Prix ou Note) */}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-600 rounded-full blur-[100px] opacity-30 z-0"></div>
      </div>


      {/* ─── Bouton CTA (Acheter / Voir) ─── */}
      {(isStructure || !isAdmin) && actions[0]}

      {/* ─── Section Engagement Instagram ─── */}
      {isStructure &&
        <div className="px-3 py-3">
          <div className="flex justify-between items-center mb-2">

            {isShowFavorie && (
              <div className="flex items-center gap-4">
                <button
                  onClick={(e) => { e.stopPropagation(); onFavorite(); }}
                  className="flex items-center gap-1 hover:scale-110 transition-transform"
                >
                  <Heart className={`w-6 h-6 ${isFavorite ? "fill-rose-500 text-rose-500" : "text-gray-900"}`} />
                </button>

                <div className={`flex opacity-100`}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={`${i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
                    />
                  ))}
                </div>

              </div>
            )}
          </div>
          <div className="space-y-1">
            <p className="text-[13px] text-gray-900 leading-snug line-clamp-3">
              <span className="font-bold mr-1.5">{displayTitle}</span>
              <span className="text-gray-700">{displaySub}</span>
            </p>
          </div>

        </div>
      }
    </div>
  );
}