import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { ProductCard } from '../../ui/productCard';
import { Pagination } from '../global/Pagination';
import { NotFound } from '../global/Notfound';
import { Button } from '../../ui/Button';
import { useAddToFavorites } from '../../hooks/useFavorites';

/**
 * UI component responsible for rendering service search.
 */
export function ServiceSearch({ providers }) {
    const navigate = useNavigate();
    const { openContact, openSidebar } = useOutletContext();
    const { mutate: addToFavorites, isSuccess: isSuccessAddFavorite, isError: isErrorAddFavorite, data: dataAddFavorite, error: errorAddFavorite } = useAddToFavorites();

    /**
     * Handles handle favorite click behavior.
     */
    const handleFavoriteClick = (providerId) => {
        addToFavorites({ providerId });
    };

    if (!providers || providers.length === 0) {
        return (
            <NotFound
                Icon={Search}
                title="Aucun prestataire trouvé"
                message="Aucun prestataire ne correspond à vos critères de recherche."
                className="bg-gray-100 h-[300px] flex-1"
            />
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
                        rating={item.averageRating || 0}
                        image={item.profilePhoto}
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

            { }
            <div className="mt-8">
                <Pagination />
            </div>
        </>
    );
}
