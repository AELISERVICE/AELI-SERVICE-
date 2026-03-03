import React, { useState, useEffect } from 'react'
import { toast } from "react-toastify";
import { useNavigate, useOutletContext } from 'react-router-dom'
import { ArrowRight, Filter, ShoppingBag, AlertCircle } from 'lucide-react'
import { ProductCard } from '../../ui/productCard'
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Loading } from '../global/Loading';
import { NotFound } from '../global/Notfound';
import { Pagination } from '../global/Pagination';
import { useGetCategory } from '../../hooks/useServices';
import { useGetProviderList } from '../../hooks/useProvider';
import { useAddToFavorites } from '../../hooks/useFavorites';

/**
 * UI component responsible for rendering services section.
 */
export function ServicesSection() {
    const navigate = useNavigate();
    const { openContact, openSidebar, filters } = useOutletContext();

    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 2; // Remets une valeur normale ici

    const { data: categoryData } = useGetCategory();
    const categoriesFromApi = categoryData?.data?.categories || [];

    const { data: providersResponse, isLoading, isError } = useGetProviderList({
        page: currentPage,
        limit: itemsPerPage,
        category: selectedCategoryId,
        search: filters?.search
    });

    const responseData = providersResponse?.data?.data || providersResponse?.data;
    const providers = responseData?.providers || [];
    const pagination = responseData?.pagination;

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategoryId, filters?.search]);

    const categoryOptions = [
        { value: '', label: 'Toutes les catégories' },
        ...categoriesFromApi.map(cat => ({
            value: cat.id,
            label: cat.name
        }))
    ];

    const { mutate: addToFavorites, isSuccess: isSuccessAddFavorite, isError: isErrorAddFavorite, data: dataAddFavorite, error: errorAddFavorite } = useAddToFavorites();

    /**
     * Handles handle favorite click behavior.
     */
    const handleFavoriteClick = (providerId) => {
        addToFavorites({ providerId });
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                    <ShoppingBag className="text-[#E8524D]" size={32} />
                    Services
                </h2>

                <div className="flex relative w-full sm:w-[300px]">
                    <Filter size={18} className="text-[#E8524D] absolute top-4 left-4 z-10" />
                    <Input
                        name="selectCategory"
                        type="select"
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        options={categoryOptions}
                        className="bg-white text-gray-700 border border-gray-200 rounded-xl !font-semibold w-full pl-12 pr-4 py-3"
                    />
                </div>
            </div>

            {isLoading ? (
                <Loading className="py-20" title="Chargement des services..." />
            ) : isError ? (
                <NotFound
                    Icon={AlertCircle}
                    title="Erreur de chargement"
                    message="Une erreur est survenue lors de la récupération des services."
                    className="bg-gray-100 h-[300px] flex-1"
                />
            ) : providers && providers.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {providers.map((item) => (
                            <ProductCard
                                key={item.id}
                                id={item.id}
                                name={item.businessName}
                                description={item.description}
                                location={item.location}
                                rating={item.averageRating}
                                image={item.photos && item.photos.length > 0 ? item.photos[0] : 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1000'}
                                isStructure={true}
                                onContact={openContact}
                                onFavorite={() => handleFavoriteClick(item.id)}
                                actions={[
                                    <Button
                                        key="btn"
                                        variant="gradient"
                                        size="md"
                                        onClick={() => navigate('/consult-provider', { state: { mode: "consultationCustomers", data: item } })}
                                        className="rounded-full px-6"
                                    >
                                        Consulter
                                        <ArrowRight size={16} className="ml-2" />
                                    </Button>
                                ]}
                            />
                        ))}
                    </div>

                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex justify-center mt-10">
                            <Pagination
                                currentPage={Number(pagination.currentPage)}
                                totalPages={Number(pagination.totalPages)}
                                onPageChange={(page) => {
                                    setCurrentPage(page);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                            />
                        </div>
                    )}
                </>
            ) : (
                <NotFound
                    Icon={ShoppingBag}
                    title="Aucun service trouvé"
                    message="Aucun service disponible dans cette catégorie."
                    className="bg-gray-100 h-[300px] flex-1"
                />
            )}
        </div>
    );
}
