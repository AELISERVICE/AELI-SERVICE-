import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '../../ui/productCard';
import { Pagination } from '../global/Pagination';
import { Button } from '../../ui/Button';

export function ServiceSearch({ providers }) {
    const navigate = useNavigate();
    const { openContact, openSidebar } = useOutletContext();

    // Fonction pour gérer les favoris (à lier à ton hook de favoris plus tard)
    const handleFavoriteClick = (id) => {
        console.log("Ajout au favoris du prestataire ID:", id);
    };

    if (!providers || providers.length === 0) {
        return (
            <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-500 font-medium">Aucun prestataire ne correspond à vos critères de recherche.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-4">
                {providers.map((item) => (
                    <ProductCard
                        key={item.id}
                        id={item.id}
                        name={item.businessName}
                        description={item.description}
                        location={item.location}
                        // Utilise la note de l'API ou 0 par défaut
                        rating={item.averageRating || 0}
                        // On prend la première photo de l'array 'photos' ou le profil, sinon le placeholder
                        image={
                            (item.photos && item.photos.length > 0) 
                            ? item.photos[0] 
                            : (item.profilePhoto || 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1000')
                        }
                        isStructure={true}
                        onContact={() => openContact(item)}
                        onFavorite={() => handleFavoriteClick(item.id)}
                        actions={[
                            <Button
                                key="btn-consult"
                                variant="gradient"
                                size="md"
                                onClick={() => navigate('/consult-provider', { 
                                    state: { mode: "consultationCustomers", data: item } 
                                })}
                                className="rounded-full px-6 flex items-center justify-center"
                            >
                                <span className={openSidebar ? "lg:inline" : "md:hidden inline"}>
                                    Consulter
                                </span>
                                <ArrowRight size={16} className="ml-2" />
                            </Button>
                        ]}
                    />
                ))}
            </div>
            
            {/* Pagination à lier avec ton état de page si nécessaire */}
            <div className="mt-8">
                <Pagination />
            </div>
        </>
    );
}