import React, { useEffect, useRef } from 'react';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { Star, Loader2, AlertCircle } from 'lucide-react';
import { ModalCard } from '../../ui/ModalCard';
import { FavoriteCard } from '../../ui/FavoriteCard';
import { CountItems } from '../global/CountItems';
import { Loading } from '../global/Loading';
import { NotFound } from '../global/Notfound';
import { Button } from '../../ui/Button';
import { useGetFavorites, useDeleteFavorites } from '../../hooks/useFavorites';

/**
 * UI component responsible for rendering favorite list.
 */
export function FavoriteList({ closeFavorite }) {
    const scrollRef = useRef(null);
    const navigate = useNavigate();

    const { data: dataFavorite, isLoading, isError } = useGetFavorites();
    const { mutate: deleteFavorite, isPending: isPendinDeleteFavorite, isSuccess: isSuccessDeleteFavorite, isError: isErrorDeleteFavorite, data: dataDeleteFavorite, error: errorDeleteFavorite } = useDeleteFavorites();
    const favorites = dataFavorite?.data?.favorites || [];

    /**
     * Handles handle remove favorite behavior.
     */
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
            title={
                <div className="flex items-center gap-2">
                    <Star className="text-yellow-500" size={20} />
                    Favoris
                </div>
            }
            closeModal={closeFavorite}
        >
            {isLoading ? (
                <Loading className="h-64" size="small" title="Chargement de vos favoris..." />
            ) : isError ? (
                <NotFound
                    Icon={AlertCircle}
                    title="Erreur de chargement"
                    message="Une erreur est survenue lors de la récupération de vos favoris."
                    className="bg-none h-[300px] border-none"
                />
            ) : (
                <>
                    { }
                    <CountItems count={favorites.length} scrollContainerRef={scrollRef} />

                    <div
                        ref={scrollRef}
                        className="flex flex-col gap-4 overflow-y-auto h-full flex-1 pb-5 md:pb-10 custom-scrollbar no-scrollbar"
                    >
                        {favorites.length > 0 ? (
                            favorites.map((fav) => {

                                const provider = fav.provider;

                                return (
                                    <div key={fav.id} className="flex-shrink-0">
                                        <FavoriteCard

                                            name={provider.businessName}
                                            image={provider.profilePhoto || `https://ui-avatars.com/api/?name=${provider.businessName}&background=random`}
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
                                                    { }
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
                </>
            )}
        </ModalCard>
    );
}
