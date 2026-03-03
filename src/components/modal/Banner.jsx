import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useGetBanners } from '../../hooks/useBanner';

/**
 * UI component responsible for rendering banner.
 */
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
        <div className="fixed z-50 -bottom-2 right-0 left-0 md:bottom-4 md:left-auto md:right-4 flex justify-center md:justify-end pointer-events-none p-4">
            {/* Taille Fixe forcée ici : w-[400px] h-[400px] */}
            <div className="w-[400px] h-[400px] bg-[#1B1B1B] text-white overflow-hidden shadow-2xl flex flex-col group font-sans rounded-2xl pointer-events-auto border border-white/5">

                {/* Header (Hauteur fixe pour stabiliser le reste) */}
                <div className="p-6 h-[80px] flex justify-between items-start z-30">
                    <div className="flex items-center gap-3">
                        <img src='./logo2.png' alt='logo' className="w-10 h-10 flex-shrink-0" />
                        <span className="font-bold text-xl pacifico-regular">
                            AELI Services
                        </span>
                    </div>
                    <button
                        onClick={closeBanner}
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content (Zone de texte avec hauteur flexible mais contenue) */}
                <div className="px-8 flex-1 flex flex-col justify-center z-20 overflow-hidden">
                    <h2 className="text-2xl font-bold leading-tight mb-2 line-clamp-2">
                        {currentBanner.title}
                    </h2>
                    <p className="text-gray-400 text-sm line-clamp-3">
                        {currentBanner.description}
                    </p>
                </div>

                {/* Image Section (Hauteur fixe : 45%) */}
                <div className="relative h-[45%] w-full mt-auto">
                    <div
                        className="absolute inset-0 z-10"
                        style={{
                            maskImage: 'radial-gradient(circle at 70% 50%, black 20%, transparent 90%)',
                            WebkitMaskImage: 'radial-gradient(circle at 70% 50%, black 20%, transparent 100%)'
                        }}
                    >
                        <img
                            key={currentBanner.imageUrl}
                            src={currentBanner.imageUrl}
                            alt={currentBanner.title}
                            className="w-full h-full object-cover object-[80%_center] opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                        />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-[#1B1B1B] via-transparent to-transparent z-20"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1B1B1B] via-transparent to-transparent z-20"></div>

                    {/* Action Button */}
                    <div className="absolute bottom-6 left-8 z-30">
                        <Button
                            type="button"
                            variant="softRed"
                            onClick={() => currentBanner.linkUrl && window.open(currentBanner.linkUrl, '_blank')}
                            className="px-6 py-2 shadow-xl hover:scale-105 transition-transform"
                        >
                            En savoir plus
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}