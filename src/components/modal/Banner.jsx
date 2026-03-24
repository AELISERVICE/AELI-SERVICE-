import React, { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useGetBanners } from '../../hooks/useBanner';

export function Banner() {
    const { data: apiResponse, isLoading: isLoadingBanner } = useGetBanners();
    const [isVisible, setIsVisible] = useState(true); // Gère la présence de la bannière

    const banners = apiResponse?.data?.banners || [];

    // Si on clique sur la croix ou s'il n'y a pas de données, on ne renvoie rien
    if (!isVisible || isLoadingBanner || banners.length === 0) return null;

    const currentBanner = banners[0]; // On prend la première bannière par défaut

    return (
        <div className="md:fixed md:top-0 md:left-0 md:right-0 md:top-6 md:left-auto md:right-6 md:z-[1002] animate-in fade-in slide-in-from-right duration-700">
            {/* Conteneur principal horizontal (Format 650x120 comme sur l'image) */}
            <div className="relative bg-white shadow-sm md:shadow-2xl border border-gray-200 overflow-hidden w-[100%] md:w-[650px] h-[140px] md:h-[120px] rounded-lg flex">

                {/* --- SECTION GAUCHE : TEXTE --- */}
                <div className="flex-1 flex flex-col justify-center px-6 md:px-10 md:z-2 bg-white">
                    <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mb-1">
                        Annonce
                    </span>
                    <h2 className="text-gray-900 font-black text-sm md:text-xl md:text-2xl leading-none uppercase italic">
                        {currentBanner.title}
                    </h2>
                    <p className="text-gray-500 text-[11px] md:text-xs line-clamp-2 mt-2 max-w-[90%] font-medium">
                        {currentBanner.description}
                    </p>
                </div>


                {/* --- SECTION DROITE : IMAGE + BOUTON CLICK --- */}
                {/* Ajout de z-20 ici pour que cette section passe par-dessus celle de gauche */}
                <div className="relative w-[35%] md:w-[40%] h-full overflow-hidden md:z-20">
                    <img
                        src={currentBanner.imageUrl}
                        alt="Visual"
                        className="w-full h-full object-cover"
                    />

                    {/* Le bouton rond "CLICK" */}
                    {/* Passage en z-50 pour être certain qu'il soit au premier plan */}
                    <div className="absolute top-1/2 left-4 -translate-x-1/2 -translate-y-1/2 md:z-100">
                        <button
                            onClick={() => currentBanner.linkUrl && window.open(currentBanner.linkUrl, '_blank')}
                            className="w-14 h-14 md:w-16 md:h-16 bg-white border-4 border-gray-50 rounded-full shadow-xl flex items-center justify-center group hover:scale-110 transition-transform active:scale-95"
                        >
                            <span className="text-blue-700 font-black text-[10px] md:text-[11px] uppercase tracking-tighter">
                                Click
                            </span>
                        </button>
                    </div>
                </div>

                {/* --- BOUTON FERMER (LA CROIX) --- */}
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-2 right-2 z-30 p-1.5 bg-black/5 hover:bg-black/10 text-gray-800 rounded-full transition-colors"
                    title="Fermer l'annonce"
                >
                    <X size={16} />
                </button>

                {/* Bordures décoratives de finition */}
                <div className="absolute top-0 right-0 w-[4px] h-full bg-[#E85D26]" />
                <div className="absolute top-0 left-0 w-[4px] h-full bg-blue-900" />
            </div>
        </div>
    );
}