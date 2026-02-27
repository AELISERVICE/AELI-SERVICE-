import React, { useEffect, useRef } from 'react';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { ModalCard } from '../../ui/ModalCard';
import { FavoriteCard } from '../../ui/FavoriteCard';
import { CountItems } from '../global/CountItems';
import { NotFound } from '../global/Notfound';
import { Button } from '../../ui/Button';
import { useGetFavorites, useDeleteFavorites } from '../../hooks/useFavorites';

export function FavoriteList({ closeFavorite }) {
    const scrollRef = useRef(null);
    const navigate = useNavigate();

    // 1. Récupération des données réelles
    const { data: dataFavorite } = useGetFavorites();
    const { mutate: deleteFavorite, isPending: isPendinDeleteFavorite, isSuccess: isSuccessDeleteFavorite, isError: isErrorDeleteFavorite, data: dataDeleteFavorite, error: errorDeleteFavorite } = useDeleteFavorites();
    const favorites = dataFavorite?.data?.favorites || [];

    const handleRemoveFavorite = (providerId) => {
        deleteFavorite({ id: providerId });
    };

    useEffect(() => {
        if (isSuccessDeleteFavorite && dataDeleteFavorite?.success) {
            toast.success(dataDeleteFavorite.message);
        }

        if (isErrorDeleteFavorite) {
            const mainMessage = errorDeleteFavorite?.message;
            toast.error(mainMessage);

            const backendErrors = errorDeleteFavorite?.response?.errors;
            if (Array.isArray(backendErrors)) {
                backendErrors.forEach((err) => {
                    toast.info(err.message);
                });
            }
        }
    }, [isSuccessDeleteFavorite, isErrorDeleteFavorite, dataDeleteFavorite, errorDeleteFavorite]);

    return (
        <ModalCard
            title="Favoris"
            closeModal={closeFavorite}
        >
            {/* On passe la longueur dynamique au compteur */}
            <CountItems count={favorites.length} scrollContainerRef={scrollRef} />

            <div
                ref={scrollRef}
                className="flex flex-col gap-4 overflow-y-auto h-full flex-1 pb-5 md:pb-10 custom-scrollbar no-scrollbar"
            >
                {favorites.length > 0 ? (
                    favorites.map((fav) => {
                        // On extrait le prestataire pour plus de clarté
                        const provider = fav.provider;

                        return (
                            <div key={fav.id} className="flex-shrink-0">
                                <FavoriteCard
                                    // Mapping des données de l'API vers les props de FavoriteCard
                                    name={provider.businessName}
                                    image={provider.photos?.[0] || 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=1000'}
                                    rating={provider.averageRating}
                                    description={provider.description}
                                    location={provider.location}
                                    dateAdded={new Date(fav.createdAt).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                    activities={provider.activities}
                                    actions={[
                                        <button
                                            key="heart-btn"
                                            onClick={() => handleRemoveFavorite(provider.id)}
                                            disabled={isPendinDeleteFavorite}
                                            className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                                            aria-label="Remove from favorites"
                                        >
                                            {/* Si on veut être précis, on pourrait gérer un loader par item, 
                                            mais ici on change juste l'icône pendant la suppression globale */}
                                            <Star className="w-4 h-4 text-yellow-500 fill-current hover:scale-110 transition-transform" />
                                        </button>,
                                        <Button
                                            key="consult-btn"
                                            variant="softRed"
                                            size="sm"
                                            onClick={() => {
                                                navigate('/consult-provider', {
                                                    state: { mode: "consultationCustomers", data: provider }
                                                });
                                                closeFavorite();
                                            }}
                                            className="rounded-xl px-5"
                                        >
                                            Consulter
                                        </Button>
                                    ]}
                                />
                            </div>
                        );
                    })
                ) : (
                    <NotFound
                        Icon={Star}
                        title="Aucun favorie trouvé"
                        message="  Vous n'avez pas encore de favoris."
                        className="bg-none h-[300px] border-none"
                    />
                )}
            </div>
        </ModalCard>
    );
}