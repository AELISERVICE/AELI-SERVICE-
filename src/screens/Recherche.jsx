import React, { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Sidebar } from '../components/global/Sidebar'
import { Header } from '../components/global/header'
import { ProductCard } from '../ui/productCard'
import { Pagination } from '../components/global/Pagination'
import { X } from 'lucide-react'

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

export function Shearch() {
    const [activeTab, setActiveTab] = useState('service')
    const { openContact } = useOutletContext()

    return (
        <div className="w-full ">
            <div className="px-6 pb-12 md:px-2">
                <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-3xl font-bold text-slate-900">Recherche</h2>

                    <div className="flex self-center rounded-2xl bg-gray-100 p-1 md:self-auto">
                        <button
                            onClick={() => setActiveTab('service')}
                            className={`rounded-xl px-8 py-2 text-sm font-medium transition-all ${activeTab === 'service' ? 'bg-fuchsia-500 text-white shadow-md' : 'text-gray-500'}`}
                        >
                            Service
                        </button>
                        <button
                            onClick={() => setActiveTab('carte')}
                            className={`rounded-xl px-8 py-2 text-sm font-medium transition-all ${activeTab === 'carte' ? 'bg-fuchsia-500 text-white shadow-md' : 'text-gray-500'}`}
                        >
                            Carte
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {PRODUCTS.map((product) => (
                        <ProductCard
                            key={product.id}
                            {...product}
                            onContact={openContact}
                        />
                    ))}
                </div>
            </div>
            <Pagination />
        </div>
    )
}