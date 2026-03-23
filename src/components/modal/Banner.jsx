import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useGetBanners } from '../../hooks/useBanner';

export function Banner({ closeBanner }) {
    const { data: apiResponse, isLoading: isLoadingBanner } = useGetBanners();
    const [currentIndex, setCurrentIndex] = useState(0);

    const banners = apiResponse?.data?.banners || [];

    useEffect(() => {
        if (banners.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % banners.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [banners.length]);

    if (isLoadingBanner || banners.length === 0) return null;

    const currentBanner = banners[currentIndex];

    return (
        <div className=" z-50 w-full flex justify-center md:justify-end pointer-events-none mb-6">
            {/* Conteneur Principal style "Campus France" */}
            <div className="w-full  bg-white shadow-2xl overflow-hidden rounded-xl pointer-events-auto border border-gray-100 flex flex-col">

                {/* ─── Header avec Diagonale Bleue ─── */}
                <div className="relative h-[150px] w-full bg-white flex items-center overflow-hidden">
                    {/* ─── IMAGE DE FOND (Partie Droite) ─── */}
                    <div className="absolute inset-0 z-0">
                        <img
                            key={currentBanner.imageUrl}
                            src={currentBanner.imageUrl}
                            alt="Banner visual"
                            className="w-full h-full object-cover object-center"
                        />
                    </div>

                    {/* ─── OVERLAY BLEU AVEC DÉGRADÉ ET CLIP-PATH ─── */}
                    <div
                        className="relative  h-full flex flex-col justify-center pl-6 pr-20 z-10 transition-all duration-500 w-[90%] md:w-[80%]"
                        style={{
                            /* Le dégradé : Bleu solide à gauche, puis transition vers transparent à droite */
                            background: 'linear-gradient(to right, #000 0%, #1B2A80 30%, rgba(27, 42, 128, 0.8) 50%, transparent 100%)',
                            clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
                        }}
                    >
                        <h2 className="text-white font-bold text-lg md:text-2xl leading-tight line-clamp-1">
                            {currentBanner.title}
                        </h2>
                        <p className="text-blue-100 text-xs md:text-sm line-clamp-2 leading-relaxed mt-1 max-w-[80%]">
                            {currentBanner.description}
                        </p>

                        <button
                            onClick={() => currentBanner.linkUrl && window.open(currentBanner.linkUrl, '_blank')}
                            className="flex items-center gap-2 text-orange-400 font-bold text-xs hover:text-orange-300 transition-colors mt-3"
                        >
                            En savoir plus <ExternalLink size={14} />
                        </button>
                    </div>

                    {/* Bouton Fermer */}
                    <button
                        onClick={closeBanner}
                        className="absolute top-2 right-2 z-30 p-1 bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-sm transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ─── Ligne d'accent Orange ─── */}
                <div className="w-full h-[4px]" style={{ backgroundColor: '#E85D26' }} />
            </div>
        </div>
    );
}