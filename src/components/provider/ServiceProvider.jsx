import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProductCard } from '../../ui/productCard'
import { Pagination } from '../global/Pagination'
import { Button, CategoryTag } from '../../ui/Button'
import { MoreHorizontal } from 'lucide-react'
import { ActionMenu } from '../global/ActionMenu'


const categories = [
    {
        id: 7,
        name: 'Categorie 1',
        active: true,
    },
    {
        id: 8,
        name: 'Categorie 2',
        active: false,
    },
    {
        id: 9,
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

    const [cats, setCats] = useState(categories);

    // 2. Fonction pour changer la catégorie active
    const handleActiveCategory = (id) => {
        setCats(prevCats =>
            prevCats.map(c => ({
                ...c,
                active: c.id === id // Devient true seulement pour l'id cliqué
            }))
        );
    };

    return (
        <>
            <div className="flex overflow-y-auto no-scrollbar items-center gap-4 mb-10">
                {cats.map((cat) => (
                    <React.Fragment key={cat.id}>
                        <CategoryTag
                            cat={cat}
                            onSelect={() => handleActiveCategory(cat.id)}
                            onPressMenu={() => setOpenMenuId(openMenuId === cat.id ? null : cat.id)}
                            ref={openMenuId === cat.id ? triggerRef : null}
                        />
                        <ActionMenu
                            isOpen={openMenuId === cat.id}
                            onClose={() => setOpenMenuId(null)}
                            triggerRef={triggerRef}
                            onEdit={() => console.log("Editer", cat.id)}
                            onDelete={() => console.log("Supprimer", cat.id)}
                        />
                    </React.Fragment>
                ))}
                <Button
                    variant="gradient"
                    size="md"
                    onClick={() => navigate("/add-category")}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
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