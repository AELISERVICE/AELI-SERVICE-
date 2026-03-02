import React, { useState, useEffect } from 'react'

export function CountItems({ count = 0, scrollContainerRef, className, clasNameChild }) {
    const [activeIndex, setActiveIndex] = useState(0)

    useEffect(() => {
        const container = scrollContainerRef?.current
        if (!container || count === 0) return

        const observerOptions = {
            root: container, // Très important : on observe DANS le scroll
            threshold: 0.5,   // Déclenche quand 50% de l'élément est visible
            rootMargin: '0px'
        }

        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const index = parseInt(entry.target.getAttribute('data-index'))
                    if (!isNaN(index)) {
                        setActiveIndex(index)
                    }
                }
            })
        }

        const observer = new IntersectionObserver(observerCallback, observerOptions)

        // On cherche spécifiquement les enfants avec data-index
        const items = container.querySelectorAll('[data-index]')
        items.forEach((item) => observer.observe(item))

        return () => observer.disconnect()
    }, [count, scrollContainerRef]) // Se relance si le nombre d'items change

    if (count === 0) return null

    return (
        <div className={`hidden md:flex flex-col gap-2 p-4 justify-center items-center h-full sticky top-0 bg-transparent ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className={`w-1.5 h-12  rounded-full transition-all duration-300 transform ${index === activeIndex
                        ? 'bg-purple-700 scale-110 shadow-sm'
                        : 'bg-purple-200 scale-100'
                        } ${clasNameChild}`}
                />
            ))}
        </div>
    )
}