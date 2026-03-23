import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ChevronRight, Search } from 'lucide-react';
import { ProductCard } from '../../ui/productCard';
import { Pagination } from '../global/Pagination';
import { NotFound } from '../global/Notfound';
import { Button } from '../../ui/Button';
import { useAddToFavorites } from '../../hooks/useFavorites';

/**
 * UI component responsible for rendering service search.
 */
export function ServiceSearch({ providers, pagination, onPageChange }) {
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 ">
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
                            <button
                                onClick={() => navigate('/consult-provider', { state: { mode: "consultationCustomers", data: item } })}
                                className="w-full bg-[#E8524D] transition-colors text-white px-4 py-3 flex justify-between items-center group/btn"
                            >
                                <span className="font-semibold text-[14px]">
                                    Consulter catalogue
                                </span>
                                <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        ]}
                    />
                ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
                <div className="mt-8">
                    <Pagination
                        currentPage={Number(pagination.currentPage)}
                        totalPages={Number(pagination.totalPages)}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </>
    );
}
