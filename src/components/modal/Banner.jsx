import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../../ui/Button';

export function Banner({ closeBanner }) {
    return (
        <div className="fixed z-4 -bottom-2 right-0 left-0 md:bottom-4 md:left-auto md:right-4 flex justify-center md:justify-end pointer-events-none p-4">
            {/* Main Square Container */}
            <div className="w-full max-w-[400px] aspect-square bg-[#1B1B1B] text-white overflow-hidden shadow-2xl flex flex-col group font-sans rounded-2xl pointer-events-auto border border-white/5">

                {/* Header Section */}
                <div className="p-6 flex justify-between items-start z-30">
                    <div className="flex items-center gap-2">
                        <svg viewBox="0 0 50 50" className="w-8 h-8 text-white fill-current">
                            <path d="M25.8 5.6c-7.4 0-13.8 4.1-17.1 10.2-1.3-1.1-3-1.8-4.9-1.8-4.1 0-7.4 3.3-7.4 7.4 0 3.3 2.1 6.1 5.1 7-1 2-1.6 4.2-1.6 6.6 0 8.3 6.7 15 15 15s15-6.7 15-15c0-2.4-.6-4.6-1.6-6.6 3-.9 5.1-3.7 5.1-7 0-4.1-3.3-7.4-7.4-7.4-1.9 0-3.6.7-4.9 1.8-3.3-6.1-9.7-10.2-17.1-10.2zm-10.9 22c1.7 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.3-3 3-3zm21.8 0c1.7 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.3-3 3-3z" />
                        </svg>
                        <span className="text-lg font-bold">GoDaddy</span>
                    </div>
                    <button
                        onClick={closeBanner}
                        className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Text Section */}
                <div className="px-8 flex-1 flex flex-col justify-center z-20">
                    <h2 className="text-2xl font-bold leading-tight mb-2">
                        Obtén un hosting <span className="text-[#00A4A6]">escalable</span> y seguro
                    </h2>
                    <p className="text-gray-400 text-sm">
                        La solution qui grandit avec votre entreprise.
                    </p>
                </div>

                {/* Image Section with Blurred Edges */}
                <div className="relative h-[45%] w-full">
                    <div
                        className="absolute inset-0 z-10"
                        style={{
                            maskImage: 'radial-gradient(circle at 70% 50%, black 20%, transparent 90%)',
                            WebkitMaskImage: 'radial-gradient(circle at 70% 50%, black 20%, transparent 100%)'
                        }}
                    >
                        <img
                            src="https://cdn.magicpatterns.com/uploads/heE9G95VTvRB37nRocKkLQ/image.png"
                            alt="Expert working"
                            className="w-full h-full object-cover object-[80%_center] opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                        />
                    </div>

                    {/* Gradient Overlay (Extra Safety) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1B1B1B] via-transparent to-transparent z-20"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1B1B1B] via-transparent to-transparent z-20"></div>

                    {/* CTA Button */}
                    <div className="absolute bottom-6 left-8 z-30">
                        <Button
                            type="button"
                            variant="softRed"
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