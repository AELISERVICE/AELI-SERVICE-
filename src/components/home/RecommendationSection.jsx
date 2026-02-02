import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '../../ui/Button'
import { RecommendationCard } from '../../ui/RecommendationCard'

const DATA = [
    {
        id: 1,
        name: 'ONLINE SHOP',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000',
        description: '5,000 years ago, Black Adam was empowered by the Egyptian gods...',
        location: 'Yaounde, Nkolbisson',
        rating: 4.2,
    },
    {
        id: 2,
        name: 'SUMMER TRENDS',
        image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000',
        description: 'Explore the latest fashion trends for the upcoming summer season.',
        location: 'Yaounde, Melen',
        rating: 3.0,
    },
    {
        id: 3,
        name: 'TECH DEALS',
        image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1000',
        description: 'Get the best discounts on high-end technology and gadgets.',
        location: 'Douala,Bepanda',
        rating: 4.5,
    },
    {
        id: 4,
        name: 'NEW LOOK',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000',
        description: 'Discover our new collection for 2026.',
        location: 'Douala, deido',
        rating: 2.5,
    },
]

export function RecommendationSection() {
    const navigate = useNavigate()
    const [activeIndex, setActiveIndex] = useState(0)
    const [rating, setRating] = useState(5);
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
                        title={item.name}
                        image={item.image}
                        description={item.description}
                        location={item.location}
                        rating={item.rating}
                        isActive={index === activeIndex}
                        actions={[
                            <Button
                                variant={index === activeIndex ? 'gradient' : 'ghost'}
                                size={index === activeIndex ? 'lg' : 'sm'}
                                onClick={() => navigate('/consult-provider', { state: { mode: "consultationCustomers", data: item } })}
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
                        className={`h-1.5 rounded-full transition-all duration-500 ${index === activeIndex ? 'w-12 bg-purple-600' : 'w-4 bg-gray-300'}`}
                    />
                ))}
            </div>
        </div>
    )
}