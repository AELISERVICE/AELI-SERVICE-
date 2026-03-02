import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ReviewCard } from '../../ui/ReviewCard';
import { CountItems } from '../global/CountItems';
import { ActionMenu } from '../global/ActionMenu';
import { MoreHorizontal, Star } from 'lucide-react';
import { useGetReviewByProvider, useDeleteReview } from '../../hooks/useReview';
import { useInfoUserConnected } from '../../hooks/useUser';
import { toast } from 'react-toastify';

export function ReviewList({ closeReview, idProvider }) {
    const { openFeedback, openConfirm, setConfirmConfig, closeModal2 } = useOutletContext();
    const scrollRef = useRef(null)
    const [openMenuId, setOpenMenuId] = useState(null)
    const triggerRef = useRef(null)

    const { data: userData } = useInfoUserConnected();
    const user = userData?.data?.user;

    const { data: dataReview, isLoading } = useGetReviewByProvider(idProvider);

    // Mutation de suppression
    const {
        mutate: mutateDeleteReview,
        isPending: isPendingDelete,
        isSuccess: isSuccessDelete,
        isError: isErrorDelete,
        data: dataDelete,
        error: errorDelete,
        reset: resetDelete
    } = useDeleteReview();

    const reviews = dataReview?.data?.reviews || [];
    const summary = dataReview?.summary;

    // TON PATTERN : Gestion des retours de suppression
    useEffect(() => {
        const isSuccess = isSuccessDelete && dataDelete?.success;
        const isError = isErrorDelete;

        if (isSuccess) {
            toast.success(dataDelete.message);
            const timer = setTimeout(() => {
                closeModal2();
            }, 1000);

            return () => clearTimeout(timer);
        }

        if (isErrorDelete) {
            const mainMessage = errorDelete?.response?.message;
            toast.error(mainMessage);

            const backendErrors = errorDelete?.response?.errors;
            if (Array.isArray(backendErrors)) {
                backendErrors.forEach((err) => {
                    toast.info(err.message);
                });
            }
        }

        if (isSuccess || isError) {
            resetDelete();
        }
    }, [isSuccessDelete, isErrorDelete, dataDelete, errorDelete, closeModal2, resetDelete]);

    const handleDeleteClick = (review) => {
        setOpenMenuId(null);
        setConfirmConfig({
            onConfirm: () => mutateDeleteReview({ id: review.id }),
            isPending: isPendingDelete,
            title: "Supprimer l'avis ?",
            description: "Voulez-vous vraiment supprimer cet avis ? Cette action est irréversible."
        });
        openConfirm();
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {summary && reviews.length > 0 && (
                <div className="flex items-center gap-2 mb-4 px-1">
                    <div className="flex items-center text-amber-500">
                        <Star size={14} fill="currentColor" />
                        <span className="text-xs font-bold ml-1">{summary.averageRating}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">({summary.totalReviews} avis)</span>
                </div>
            )}

            <div
                ref={scrollRef}
                className="flex-1 flex gap-6 overflow-x-auto h-full pb-5 md:pb-10 no-scrollbar scroll-smooth"
            >
                {reviews.length > 0 ? (
                    reviews.map((review, index) => {
                        const isOwner = user?.id === review.userId;

                        return (
                            <div key={review.id} data-index={index} className="relative flex-shrink-0">
                                <ReviewCard
                                    id={review.id}
                                    name={review.user.firstName}
                                    imageUrl={review.user.profilePhoto}
                                    testimonial={review.comment}
                                    rating={review.rating}
                                    role="Client"
                                    timestamp={new Date(review.createdAt).toLocaleDateString()}
                                    actions={isOwner ? [
                                        <button
                                            key="trigger"
                                            ref={openMenuId === review.id ? triggerRef : null}
                                            onClick={() => setOpenMenuId(openMenuId === review.id ? null : review.id)}
                                            className="p-1 text-gray-400 hover:text-gray-600"
                                        >
                                            <MoreHorizontal size={20} />
                                        </button>,
                                        <ActionMenu
                                            key="menu"
                                            isOpen={openMenuId === review.id}
                                            onClose={() => setOpenMenuId(null)}
                                            triggerRef={triggerRef}
                                            onEdit={() => {
                                                setOpenMenuId(null);
                                                openFeedback(review);
                                            }}
                                            onDelete={() => handleDeleteClick(review)}
                                        />
                                    ] : []}
                                />
                            </div>
                        )
                    })
                ) : (
                    <div className="w-full text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                        <p className="text-xs text-gray-400 font-medium">Aucun avis pour le moment</p>
                    </div>
                )}
            </div>

            {reviews.length > 0 && (
                <CountItems
                    count={reviews.length}
                    scrollContainerRef={scrollRef}
                    className="flex-row"
                    clasNameChild="w-12 h-[6px]"
                />
            )}
        </div>
    )
}