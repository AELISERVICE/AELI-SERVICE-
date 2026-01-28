import React, { useState, useEffect, useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '../../ui/Button'
import { RecommendationCard } from '../../ui/RecommendationCard'

const DATA = [
    { id: 1, title: 'ONLINE SHOP', description: '5,000 years ago, Black Adam was empowered by the Egyptian gods...' },
    { id: 2, title: 'SUMMER TRENDS', description: 'Explore the latest fashion trends for the upcoming summer season.' },
    { id: 3, title: 'TECH DEALS', description: 'Get the best discounts on high-end technology and gadgets.' },
    { id: 4, title: 'NEW LOOK', description: 'Discover our new collection for 2026.' },
]

export function RecommendationSection() {
    const [activeIndex, setActiveIndex] = useState(0)
    // On précise le type HTMLDivElement pour TypeScript
    const scrollRef = useRef(null)

    // 1. Gérer l'intervalle automatique
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % DATA.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    // 2. SCROLL AUTOMATIQUE : Cette partie déplace le scroll quand activeIndex change
    useEffect(() => {
        if (scrollRef.current) {
            const container = scrollRef.current
            const activeItem = container.children[activeIndex]

            if (activeItem) {
                // On calcule la position pour centrer la carte active
                const scrollLeft = activeItem.offsetLeft - (container.offsetWidth / 2) + (activeItem.offsetWidth / 2)

                container.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                })
            }
        }
    }, [activeIndex])

    return (
        <div >


            <div
                ref={scrollRef}
                className="flex items-center gap-4 overflow-x-auto pb-10 no-scrollbar scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {DATA.map((item, index) => (
                    <RecommendationCard
                        key={item.id}
                        title={item.title}
                        description={item.description}
                        isActive={index === activeIndex}
                        actions={[
                            <Button
                                variant={index === activeIndex ? 'gradient' : 'ghost'}
                                size={index === activeIndex ? 'lg' : 'sm'}
                                className={index === activeIndex ? 'px-8' : 'text-gray-300'}
                            >
                                {index === activeIndex ? 'Consulter catalogue' : 'Voir plus'}
                                <ArrowRight size={16} className="ml-2" />
                            </Button>
                        ]}
                    />
                ))}
            </div>

            {/* Pagination Dots */}
            <div className="flex gap-4 justify-center">
                {DATA.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveIndex(index)}
                        className={`h-1.5 rounded-full transition-all duration-500 ${index === activeIndex ? 'w-12 bg-purple-600' : 'w-4 bg-gray-300'
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}