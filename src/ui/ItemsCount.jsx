import React from 'react'

export function ItemsCount({ count = 0, activeIndex }) {
    return (
        <div className="hidden md:flex flex-col gap-2 p-4 justify-center items-center h-full sticky top-0 bg-transparent">
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={`w-1.5 h-12 rounded-full transition-all duration-300 transform ${index === activeIndex
                        ? 'bg-purple-700 scale-110 shadow-sm'
                        : 'bg-purple-200 scale-100'
                        }`}
                />
            ))}
        </div>
    )
}