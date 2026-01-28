import React from 'react'
import { useOutletContext } from 'react-router-dom'
import { ProductCard } from '../../ui/productCard'
import { Button } from '../../ui/Button'

const PRODUCTS = [
    {
        id: 1,
        name: 'Sophie Bennett',
        role: 'A Product Designer focused on intuitive user experiences.',
        likes: 212,
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 2,
        name: 'Sophie Bennett',
        role: 'A Product Designer focused on intuitive user experiences.',
        likes: 212,
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 3,
        name: 'Sophie Bennett',
        role: 'A Product Designer focused on intuitive user experiences.',
        likes: 212,
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 4,
        name: 'Sophie Bennett',
        role: 'A Product Designer focused on intuitive user experiences.',
        likes: 212,
        image: 'https://images.unsplash.com/photo-1615184697985-c9bde1b07da7?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 5,
        name: 'Sophie Bennett',
        role: 'A Product Designer focused on intuitive user experiences.',
        likes: 212,
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 6,
        name: 'Sophie Bennett',
        role: 'A Product Designer focused on intuitive user experiences.',
        likes: 212,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 7,
        name: 'Sophie Bennett',
        role: 'A Product Designer focused on intuitive user experiences.',
        likes: 212,
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800',
    },
    {
        id: 8,
        name: 'Sophie Bennett',
        role: 'A Product Designer focused on intuitive user experiences.',
        likes: 212,
        image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=800',
    },
]

export function ServicesSection() {
    const { openContact, openFeedback } = useOutletContext()

    return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {PRODUCTS.map((product) => (
                <ProductCard
                    key={product.id}
                    {...product}
                    onContact={openContact}
                    onFeedback={openFeedback}
                    actions={[
                        <Button
                            variant="softRed"
                            size="md"
                            onClick={openContact}
                            className="rounded-full px-6"
                        >
                            Contacter
                        </Button>
                    ]}
                />
            ))}
        </div>
    )
}