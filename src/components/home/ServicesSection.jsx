import React, { useState, useEffect } from 'react'
import { toast } from "react-toastify";
import { useNavigate, useOutletContext } from 'react-router-dom'
import { ArrowRight, Filter, ShoppingBag } from 'lucide-react'
import { ProductCard } from '../../ui/productCard'
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { NotFound } from '../global/Notfound';
import { Pagination } from '../global/Pagination';
import { useGetCategory } from '../../hooks/useServices';
import { useGetProviderList } from '../../hooks/useProvider';
import { useAddToFavorites } from '../../hooks/useFavorites';


export function ServicesSection() {
    const navigate = useNavigate();
    const { openContact, openFeedback, openSidebar } = useOutletContext();

    // État pour la catégorie sélectionnée (ID de la catégorie)
    const [selectedCategoryId, setSelectedCategoryId] = useState('');

    // 1. Récupération des catégories pour le Select
    const { data: categoryData } = useGetCategory();
    const categoriesFromApi = categoryData?.data?.categories || [];

    // 2. Récupération de tous les prestataires
    const { data: providersResponse, isLoading } = useGetProviderList();

    // CORRECTION ICI : Ton JSON a une double imbrication "data"
    const allProviders = providersResponse?.data?.providers || [];

    // Préparation des options du Select
    const categoryOptions = [
        { value: '', label: 'Toutes les catégories' },
        ...categoriesFromApi.map(cat => ({
            value: cat.id,
            label: cat.name
        }))
    ];

    // 3. LOGIQUE DE FILTRAGE CÔTÉ CLIENT
    const filteredData = selectedCategoryId === ''
        ? allProviders
        : allProviders.filter(provider =>
            // On vérifie si l'ID de la catégorie sélectionnée est présent dans le tableau categories du prestataire
            provider.categories?.some(cat => cat.id === selectedCategoryId)
        );


    const { mutate: addToFavorites, isSuccess: isSuccessAddFavorite, isError: isErrorAddFavorite, data: dataAddFavorite, error: errorAddFavorite } = useAddToFavorites();

    const handleFavoriteClick = (providerId) => {
        addToFavorites({ providerId }, {
            onSuccess: () => {
                // Petit bonus : un message de succès
                console.log("Ajouté aux favoris !");
            },
            onError: (error) => {
                if (error.status === 400) {
                    console.warn("Déjà dans vos favoris");
                }
            }
        });
    };

    useEffect(() => {
        if (isSuccessAddFavorite && dataAddFavorite?.success) {
            toast.success(dataAddFavorite.message);
        }

        if (isErrorAddFavorite) {
            const mainMessage = errorAddFavorite?.message;
            toast.error(mainMessage);

            const backendErrors = errorAddFavorite?.response?.errors;
            if (Array.isArray(backendErrors)) {
                backendErrors.forEach((err) => {
                    toast.info(err.message);
                });
            }
        }
    }, [isSuccessAddFavorite, isErrorAddFavorite, dataAddFavorite, errorAddFavorite]);


    return (
        <div className="space-y-8">
            <div className="flex flex-row items-center justify-between gap-4">
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Services</h2>

                <div className="flex relative w-[250px]">
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

            {filteredData.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredData.map((item) => (
                        <ProductCard
                            key={item.id}
                            id={item.id}
                            name={item.businessName}
                            description={item.description}
                            location={item.location}
                            rating={item.averageRating}
                            // Gestion de l'image (prend la 1ère ou un placeholder)
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
                                    <span className={openSidebar ? "lg:inline" : "md:hidden inline"}>Consulter</span>
                                    <ArrowRight size={16} className="ml-2" />
                                </Button>
                            ]}
                        />
                    ))}
                </div>
            ) : (
                <NotFound
                    Icon={ShoppingBag}
                    title="Aucun prestataire trouvé"
                    message="  Aucun prestataire ne correspond à cette catégorie."
                    className="bg-gray-100 h-[300px]"
                />
            )}
            {filteredData.length > 0 &&
                <Pagination />
            }
        </div>
    );
}