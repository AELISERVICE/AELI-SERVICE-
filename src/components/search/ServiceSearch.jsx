import React from 'react';
import { useOutletContext } from 'react-router-dom'
import { ProductCard } from '../../ui/productCard';
import { Pagination } from '../global/Pagination';
import { Button } from '../../ui/Button'


const data = [
    {
        id: 1,
        title: 'Pantalon Cargo Sable',
        description: 'Coupe décontractée en coton robuste avec poches latérales fonctionnelles.',
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop',
        likes: 124,
        price: 5000,
        category: 'Lifestyle',
        showMenu: true,
    },
    {
        id: 2,
        title: 'Jean Slim Indigo',
        description: 'Denim stretch premium pour un confort optimal et une silhouette affinée.',
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop',
        likes: 89,
        price: 5500,
        category: 'Denim',
    },
    {
        id: 3,
        title: 'Chino Slim Olive',
        description: 'L\'équilibre parfait entre élégance et décontracté pour vos sorties.',
        image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=800&fit=crop',
        likes: 210,
        price: 14000,
        category: 'Classique',
    },
    {
        id: 4,
        title: 'Pantalon Lin Beige',
        description: 'Matière légère et respirante, idéal pour les journées ensoleillées.',
        image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop',
        likes: 56,
        price: 30000,
        category: 'Été',
    },
    {
        id: 5,
        title: 'Jogging Tech Fleece',
        description: 'Style urbain avec finition hydrophobe et coupe ajustée.',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=800&fit=crop',
        likes: 312,
        price: 25000,
        category: 'Sport',
    },
    {
        id: 6,
        title: 'Pantalon Velours Côtelé',
        description: 'Texture rétro et chaleur douce pour la saison automne-hiver.',
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop',
        likes: 142,
        price: 100000,
        category: 'Hiver',
    },
]



export function ServiceSearch() {
    const { openContact, openFeedback } = useOutletContext()

    return (
        <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-4">
                {data.map((item) => (
                    <ProductCard
                        key={item.id}
                        {...item}
                        onContact={openContact}
                        onFeedback={openFeedback}
                        actions={[
                            <Button
                                variant="gradient"
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
            <Pagination />
        </>
    );
}