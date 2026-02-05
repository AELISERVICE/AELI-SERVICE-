import React, { useState, useRef } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { ProductCard } from '../../ui/productCard'
import { Pagination } from '../global/Pagination'
import { Button, CategoryTag } from '../../ui/Button'
import { MoreHorizontal } from 'lucide-react'
import { ActionMenu } from '../global/ActionMenu'
import { Star, MapPin } from 'lucide-react'


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
        title: 'Pantalon Cargo Sable',
        description: 'Coupe décontractée en coton robuste avec poches latérales fonctionnelles.',
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop',
        likes: 124,
        price: 40000,
        category: 'Lifestyle',
        showMenu: true,
    },
    {
        id: 2,
        title: 'Jean Slim Indigo',
        description: 'Denim stretch premium pour un confort optimal et une silhouette affinée.',
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop',
        likes: 89,
        price: 4500,
        category: 'Denim',
    },
    {
        id: 3,
        title: 'Chino Slim Olive',
        description: 'L\'équilibre parfait entre élégance et décontracté pour vos sorties.',
        image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=800&fit=crop',
        likes: 210,
        price: 55000,
        category: 'Classique',
    },
    {
        id: 4,
        title: 'Pantalon Lin Beige',
        description: 'Matière légère et respirante, idéal pour les journées ensoleillées.',
        image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop',
        likes: 56,
        price: 17000,
        category: 'Été',
    },
    {
        id: 5,
        title: 'Jogging Tech Fleece',
        description: 'Style urbain avec finition hydrophobe et coupe ajustée.',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=800&fit=crop',
        likes: 312,
        price: 12000,
        category: 'Sport',
    },
    {
        id: 6,
        title: 'Pantalon Velours Côtelé',
        description: 'Texture rétro et chaleur douce pour la saison automne-hiver.',
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop',
        likes: 142,
        price: 120000,
        category: 'Hiver',
    },
]

export function ServiceProvider({ mode, data }) {
    const navigate = useNavigate()
    const [openMenuId, setOpenMenuId] = useState(null)
    const triggerRef = useRef(null)
    const [cats, setCats] = useState(categories);
    const { openContact, openFeedback, openSidebar } = useOutletContext()
    const [rating, setRating] = useState(5);
    const [customerContact, SetcustomerContact] = useState(false)

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
            {mode === "consultationCustomers" && (
                <div>
                    <div className="flex flex-col md:flex-row gap-5 mb-10 md:mb-8">
                        <div className="w-32 h-32 rounded-full border-4 border-pink-200 flex  relative mb-4">
                            <div className="w-full h-full rounded-full overflow-hidden no-scrollbar">
                                <img
                                    src={data?.image}
                                    alt="Stats"
                                    className="w-full h-full object-cover opacity-80"
                                />
                            </div>
                            <div className="absolute inset-0 border-t-4 border-purple-500 rounded-full rotate-45" />
                        </div>
                        <div className='md:max-w-2/4'>
                            <h4 className="font-bold text-[25px] text-gray-800">{data?.name}</h4>
                            <p className="text-xs text-gray-500 mt-1 ">
                                Franchir la porte de notre institut, c'est s'offrir une parenthèse enchantée loin du tumulte du quotidien. Dès l'entrée, l'atmosphère se veut apaisante et raffinée : des nuances poudrées, des matériaux naturels et une lumière tamisée vous enveloppent dans un cocon de douceur.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {data?.activities.map((act) => (
                                    <span
                                        key={act}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-[#E8524D]/10 text-[#E8524D] text-sm font-medium rounded-full border border-[#E8524D]/20 animate-in zoom-in duration-200"
                                    >
                                        {act}
                                    </span>
                                ))}
                            </div>
                            <p className="flex gap-2 items-center text-xs text-gray-500 mt-1 mt-4 mb-4">
                                <MapPin className="text-gray-500" size={16} />
                                {data?.location}
                            </p>
                            <div className="flex gap-4 mt-2 items-center">
                                <Button
                                    variant="softRed"
                                    size="md"
                                    onClick={openFeedback}
                                    className={`${!customerContact && "bg-gray-300 hover:bg-gray-300 hover:text-white"}`}
                                >
                                    noter
                                </Button>
                                <div className="flex ">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={14}
                                            className={`${i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex overflow-y-auto no-scrollbar items-center gap-4 mb-10">
                {cats.map((cat) => (
                    <React.Fragment key={cat.id}>
                        <CategoryTag
                            cat={cat}
                            isConsult={mode === "consultationCustomers" ? true : false}
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
                {mode != "consultationCustomers" && (
                    <Button
                        variant="gradient"
                        size="md"
                        onClick={() => navigate("/add-category")}
                    >
                        ajouter
                    </Button>
                )}
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Categorie 1</h2>
                {mode != "consultationCustomers" && (
                    <Button
                        variant="gradient"
                        size="md"
                        onClick={() => navigate("/add-service")}
                    >
                        Ajouter
                    </Button>
                )}
            </div>
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${mode == "consultationCustomers" ? `${openSidebar ? "lg:grid-cols-3 xl:grid-cols-4 " : "lg:grid-cols-3 xl:grid-cols-4"}` : "lg:grid-cols-3"} gap-6 mb-4`}>
                {
                    products.map((product) => (
                        <ProductCard
                            key={product.id}
                            {...product}
                            isAdmin={true}
                            actions={mode === "consultationCustomers"
                                ? [
                                    <Button
                                        key="view"
                                        variant="gradient"
                                        size="sm"
                                        onClick={openContact}
                                    >
                                        Contacter
                                    </Button>
                                ]
                                : [
                                    <Button
                                        key="trigger"
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
                                        triggerRef={triggerRef}
                                        onEdit={() => console.log("Editer", product.id)}
                                        onDelete={() => console.log("Supprimer", product.id)}
                                    />
                                ]
                            }
                        />
                    ))
                }
            </div >
            <Pagination />
        </>
    )
}