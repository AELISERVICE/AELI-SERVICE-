import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { toast } from "react-toastify";
import { ProductCard } from '../../ui/productCard';
import { Button, CategoryTag } from '../../ui/Button';
import { MoreHorizontal, Star, MapPin, ShoppingBag } from 'lucide-react';
import { ActionMenu } from '../global/ActionMenu';
import { NotFound } from '../global/Notfound';
import { Pagination } from '../global/Pagination';
import { useInfoUserConnected } from '../../hooks/useUser';
import { useGetServicesByProvider, useDeleteServices } from '../../hooks/useServices';
import { useGetProviderByid } from '../../hooks/useProvider';


export function ServiceProvider({ mode, dataConsult }) {
    const navigate = useNavigate();
    const [openMenuId, setOpenMenuId] = useState(null);
    const triggerRef = useRef(null);
    const { openContact, openFeedback, openConfirm, setConfirmConfig, closeModal2, setIsLoading, setDataContact } = useOutletContext();
    const [rating, setRating] = useState(5);
    const [customerContact, SetcustomerContact] = useState(false);

    // --- DATA FETCHING ---
    const { data: userData } = useInfoUserConnected();
    const provider = userData?.data?.provider;

    const { data: providerResponse, isLoading: isLoadingProvider } = useGetProviderByid(dataConsult?.id);
    const providerDetail = providerResponse?.data?.provider;

    const { data: servicesData, refetch: refetchService } = useGetServicesByProvider(provider?.id);

    // --- LOGIQUE DE REGROUPEMENT DES SERVICES PAR CATÉGORIE (MODE CONSULTATION) ---
    const apiCategories = useMemo(() => {
        if (mode === "consultationCustomers") {
            if (!providerDetail?.services) return [];

            // On transforme la liste de services en liste de catégories avec services imbriqués
            const categoriesMap = providerDetail.services.reduce((acc, service) => {
                const cat = service.category;
                if (!cat) return acc;

                if (!acc[cat.id]) {
                    acc[cat.id] = {
                        id: cat.id,
                        name: cat.name,
                        slug: cat.slug,
                        services: []
                    };
                }
                acc[cat.id].services.push(service);
                return acc;
            }, {});

            return Object.values(categoriesMap);
        }

        // Mode manager (garde la structure existante)
        return servicesData?.data?.categories || [];
    }, [mode, providerDetail, servicesData]);

    const { mutate: mutateDeleteService, isPending: isPendingDeleteService, isSuccess: isSuccessDeleteService, isError: isErrorDeleteService, data: dataDeleteService, error: errorDeleteService } = useDeleteServices();

    const [activeCatId, setActiveCatId] = useState(null);

    useEffect(() => {
        if (apiCategories.length > 0 && !activeCatId) {
            setActiveCatId(apiCategories[0].id);
        }
    }, [apiCategories, activeCatId]);

    const currentCategory = apiCategories.find(c => c.id === activeCatId);
    const currentServices = currentCategory?.services || [];

    // --- LOGIQUE SUPPRESSION ---
    const handleDeleteClick = (service) => {
        setOpenMenuId(null);
        setConfirmConfig({
            onConfirm: () => mutateDeleteService({ id: service.id }),
            isPending: false,
            title: `Supprimer le service "${service.name}" ?`,
            description: "Cette action est irréversible. Le service sera définitivement supprimé."
        });
        openConfirm();
    };

    const openContactWithData = (provider, service) => {
        setDataContact({
            ...provider,
            selectedService: service // Ici service contient : name, price, description, etc.
        });
        openContact();
    }

    useEffect(() => {
        setConfirmConfig(prev => ({ ...prev, isPending: isPendingDeleteService }));
    }, [isPendingDeleteService, setConfirmConfig]);

    useEffect(() => {
        if (isSuccessDeleteService && dataDeleteService?.success) {
            toast.success(dataDeleteService.message);
            closeModal2();
            refetchService();
        }
    }, [isSuccessDeleteService, dataDeleteService, closeModal2, refetchService]);

    useEffect(() => {
        setIsLoading(mode === "consultationCustomers" ? isLoadingProvider : !servicesData);
    }, [servicesData, isLoadingProvider, mode, setIsLoading]);

    useEffect(() => {
        if (providerDetail?.averageRating) {
            setRating(Math.round(parseFloat(providerDetail.averageRating)));
        }
    }, [providerDetail]);

    return (
        <>
            {mode === "consultationCustomers" && (
                <div>
                    <div className="flex flex-col md:flex-row gap-5 mb-10 md:mb-8">
                        <div className="w-32 h-32 rounded-full border-4 border-pink-200 flex relative mb-4">
                            <div className="w-full h-full rounded-full overflow-hidden no-scrollbar">
                                <img
                                    src={providerDetail?.photos?.[0] || dataConsult?.image || `https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1000`}
                                    alt="Stats"
                                    className="w-full h-full object-cover opacity-80"
                                />
                            </div>
                            <div className="absolute inset-0 border-t-4 border-purple-500 rounded-full rotate-45" />
                        </div>
                        <div className='md:max-w-2/4'>
                            <h4 className="font-bold text-[25px] text-gray-800">
                                {providerDetail?.businessName || dataConsult?.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1 ">
                                {providerDetail?.description || "Franchir la porte de notre institut, c'est s'offrir une parenthèse enchantée..."}
                            </p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {(providerDetail?.activities || dataConsult?.activities)?.map((act) => (
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
                                {providerDetail?.location || dataConsult?.location}
                            </p>
                            <div className="flex gap-4 mt-2 items-center">
                                <Button
                                    variant="softRed"
                                    size="md"
                                    onClick={() => openFeedback(providerDetail)}
                                    className={`${!customerContact && "bg-gray-300 hover:bg-gray-300 hover:text-white"}`}
                                >
                                    noter
                                </Button>
                                <div className="flex">
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

            <div className="flex overflow-x-auto no-scrollbar items-center gap-4 mb-10">
                {apiCategories.map((cat) => (
                    <React.Fragment key={cat.id}>
                        <div className="relative">
                            <CategoryTag
                                cat={{ ...cat, active: cat.id === activeCatId }}
                                isConsult={mode === "consultationCustomers"}
                                onSelect={() => setActiveCatId(cat.id)}
                                onPressMenu={() => setOpenMenuId(openMenuId === cat.id ? null : cat.id)}
                                ref={openMenuId === cat.id ? triggerRef : null}
                            />
                            {mode !== "consultationCustomers" && (
                                <ActionMenu
                                    isOpen={openMenuId === cat.id}
                                    onClose={() => setOpenMenuId(null)}
                                    triggerRef={triggerRef}
                                    onEdit={() => navigate(`/edit-category/${cat.id}`)}
                                    onDelete={() => console.log("Supprimer", cat.id)}
                                />
                            )}
                        </div>
                    </React.Fragment>
                ))}
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                    {currentCategory?.name || "Sélectionnez une catégorie"}
                </h2>
                {mode !== "consultationCustomers" && (
                    <Button variant="gradient" size="md" onClick={() => navigate("/add-service")}>
                        Ajouter un service
                    </Button>
                )}
            </div>

            <div className={`grid grid-cols-1 ${mode === "consultationCustomers" && currentServices.length > 0 ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : currentServices.length > 0 ? "sm:grid-cols-2 lg:grid-cols-3" : "flex"} gap-6 mb-4`}>
                {currentServices.length > 0 ? (
                    currentServices.map((service) => (
                        <ProductCard
                            key={service.id}
                            title={service.name}
                            description={service.description}
                            price={service.price}
                            image={service.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800"}
                            isAdmin={mode !== "consultationCustomers"}
                            actions={mode === "consultationCustomers"
                                ? [
                                    <Button
                                        key="view"
                                        variant="gradient"
                                        size="sm"
                                        onClick={() => openContactWithData(providerDetail, service)}
                                    >
                                        Contacter
                                    </Button>
                                ]
                                : [
                                    <Button
                                        key="trigger"
                                        variant="ghost"
                                        size="sm"
                                        ref={openMenuId === service.id ? triggerRef : null}
                                        onClick={() => setOpenMenuId(openMenuId === service.id ? null : service.id)}
                                        className="text-white hover:bg-white/20 rounded-full p-2"
                                    >
                                        <MoreHorizontal size={20} />
                                    </Button>,
                                    <ActionMenu
                                        isOpen={openMenuId === service.id}
                                        onClose={() => setOpenMenuId(null)}
                                        triggerRef={triggerRef}
                                        onEdit={() => navigate(`/add-service`, { state: { data: service } })}
                                        onDelete={() => handleDeleteClick(service)}
                                    />
                                ]
                            }
                        />
                    ))
                ) : (
                    <NotFound
                        Icon={ShoppingBag}
                        title="Aucun services trouvé"
                        message="  Aucun service disponible dans cette catégorie."
                        className="bg-gray-100 h-[300px] flex-1"
                    />
                )}
            </div>
            {currentServices.length > 0 &&
                <Pagination />
            }
        </>
    )
}