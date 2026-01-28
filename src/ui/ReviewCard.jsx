import React from 'react'
import { Star } from 'lucide-react'

export function ReviewCard({ name, role, company, imageUrl, testimonial, rating = 5, actions }) {
    return (
        <div className="w-full max-w-sm mx-auto bg-white rounded-[2rem] shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden relative group">
            {/* Section Haut */}
            <div className="bg-[#F3F4F6] p-6 pb-8">
                <div className="flex items-center gap-4">
                    <img src={imageUrl} alt={name} className="w-20 h-20 rounded-2xl object-cover shadow-sm" />
                    <div className="flex flex-col">
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">{name}</h3>
                        <p className="text-sm text-gray-500 font-medium">{role}</p>
                        <p className="text-sm text-gray-400">{company}</p>
                    </div>
                </div>
            </div>

            {/* Pillule de Rating */}
            <div className="relative h-0 flex justify-center items-center z-10">
                <div className="-top-4 absolute bg-white px-4 py-1.5 rounded-full shadow-sm flex gap-1 items-center">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={14}
                            className={`${i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Section Bas */}
            <div className="bg-white px-8 pt-10 pb-6 relative">
                <p className="text-center text-gray-600 text-sm leading-relaxed mb-6">
                    {testimonial}
                </p>

                {/* Slot pour les actions injectées par le Component */}
                <div className="flex justify-end relative">
                    {actions && actions[0]}
                    {actions && actions[1]}
                </div>
            </div>
        </div>
    )
}