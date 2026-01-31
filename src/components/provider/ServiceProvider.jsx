import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProductCard } from '../../ui/productCard'
import { Pagination } from '../global/Pagination'
import { Button } from '../../ui/Button'
import { MoreHorizontal } from 'lucide-react'
import { ActionMenu } from '../global/ActionMenu'


const categories = [
    {
        name: 'Categorie 1',
        active: true,
    },
    {
        name: 'Categorie 2',
        active: false,
    },
    {
        name: 'Categorie 4',
        active: false,
    },
]

const products = [
    {
        id: 1,
        title: 'Sophie Bennett',
        description: 'A Product Designer focused on intuitive user experiences.',
        image:
            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=800&fit=crop',
        likes: 312,
        showMenu: true,
    },
    {
        id: 2,
        title: 'Sophie Bennett',
        description: 'A Product Designer focused on intuitive user experiences.',
        image:
            'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&h=800&fit=crop',
        likes: 312,
    },
    {
        id: 3,
        title: 'Sophie Bennett',
        description: 'A Product Designer focused on intuitive user experiences.',
        image:
            'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=800&fit=crop',
        likes: 312,
    },
    {
        id: 4,
        title: 'Sophie Bennett',
        description: 'A Product Designer focused on intuitive user experiences.',
        image:
            'https://images.unsplash.com/photo-1589156229687-496a31ad1d1f?w=600&h=800&fit=crop',
        likes: 312,
    },
    {
        id: 5,
        title: 'Sophie Bennett',
        description: 'A Product Designer focused on intuitive user experiences.',
        image:
            'https://images.unsplash.com/photo-1550614000-4b9519e02d2c?w=600&h=800&fit=crop',
        likes: 312,
    },
    {
        id: 6,
        title: 'Sophie Bennett',
        description: 'A Product Designer focused on intuitive user experiences.',
        image:
            'https://images.unsplash.com/photo-1605763240004-7e93b172d754?w=600&h=800&fit=crop',
        likes: 312,
    },
]

export function ServiceProvider() {
    const navigate = useNavigate()
    const [openMenuId, setOpenMenuId] = useState(null)
    const triggerRef = useRef(null)

    return (
        <>
            <div className="flex overflow-y-auto no-scrollbar items-center gap-4 mb-10">
                {categories.map((cat, i) => (
                    <button
                        key={i}
                        className={`
                                    px-6 py-2.5 rounded-2xl text-sm font-medium transition-all whitespace-nowrap
                                    ${cat.active ?
                                'bg-purple-50 text-purple-700 shadow-sm ring-1 ring-purple-100' :
                                'bg-white text-gray-500 hover:bg-gray-50 border border-transparent hover:border-gray-100'
                            }
                                `}
                    >
                        {cat.name}
                        {cat.active && <span className="ml-2 text-xs">⋮</span>}
                    </button>
                ))}
                <Button
                    variant="gradient"
                    size="md"
                    onClick={() => navigate("/add-service")}
                >
                    ajouter
                </Button>
            </div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Categorie 1</h2>

                <Button
                    variant="gradient"
                    size="md"
                    onClick={() => navigate("/add-service")}
                >
                    Ajouter
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {
                    products.map((product) => (
                        <ProductCard
                            key={product.id}
                            {...product} isAdmin={true}
                            actions={[

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    ref={openMenuId === product.id ? triggerRef : null}
                                    onClick={() => setOpenMenuId(openMenuId === product.id ? null : product.id)}
                                    className="text-white hover:bg-white/20 rounded-full p-2"
                                >
                                    <MoreHorizontal size={20} />
                                </Button>,
                                <ActionMenu
                                    key="menu"
                                    isOpen={openMenuId === product.id}
                                    onClose={() => setOpenMenuId(null)}
                                    triggerRef={triggerRef} // On passe la ref ici
                                    onEdit={() => console.log("Editer", product.id)}
                                    onDelete={() => console.log("Supprimer", product.id)}
                                />
                            ]}
                        />
                    ))
                }
            </div >
            <Pagination />
        </>
    )
}