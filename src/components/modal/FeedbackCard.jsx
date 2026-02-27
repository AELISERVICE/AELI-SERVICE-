import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { RatingStars } from "../../ui/RatingStars";
import { Button } from "../../ui/Button";
import { useCreateReview } from '../../hooks/useReview';

export function FeedbackCard({ closeFeedback, providerData }) {
  const navigate = useNavigate()
  const [hoverRating, setHoverRating] = useState(0);

  // Utilisation de tes noms de variables exacts
  const {
    mutate: mutateAddFeedback,
    isSuccess: isSuccessAddFeedback,
    isPending: isPendingAddFeedback,
    isError: isErrorAddFeedback,
    data: dataAddFeedback, // Note: dans useMutation c'est "data", on le mappe vers dataAddFeedback
    error: errorAddFeedback
  } = useCreateReview();

  const [formData, setFormData] = useState({
    providerId: "",
    rating: 0,
    comment: ""
  });

  // Synchronisation du providerId
  useEffect(() => {
    if (providerData?.id) {
      setFormData(prev => ({ ...prev, providerId: providerData.id }));
    }
  }, [providerData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRateChange = (value) => {
    setFormData((prev) => ({ ...prev, rating: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutateAddFeedback(formData);
  };

  // Gestion des retours API
  useEffect(() => {
    if (isSuccessAddFeedback && dataAddFeedback?.success) {
      toast.success(dataAddFeedback.message);
      closeFeedback();
    }

    if (isErrorAddFeedback) {
      const mainMessage = errorAddFeedback?.response?.message;
      toast.error(mainMessage);

      const backendErrors = errorAddFeedback?.response?.data?.errors;
      if (Array.isArray(backendErrors)) {
        backendErrors.forEach((err) => toast.info(err.message));
      }
    }
  }, [isSuccessAddFeedback, isErrorAddFeedback, dataAddFeedback, errorAddFeedback, closeFeedback]);

  return (
    <div
      onClick={closeFeedback}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm h-screen flex flex-col justify-center items-center z-10 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl h-auto overflow-hidden animate-in zoom-in duration-300"
      >
        <div className="p-6 sm:p-8 md:p-10">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img
                src={providerData?.photos?.[0] || "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=1000"}
                alt={providerData?.businessName}
                className="w-20 h-20 rounded-full ring-4 ring-white shadow-lg object-cover"
              />
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Évaluez votre expérience
            </h1>
            <p className="text-gray-500 text-sm">
              Comment s'est passé votre service avec{" "}
              <span className="font-semibold text-gray-900">
                {providerData?.businessName || "le prestataire"}
              </span> ?
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <RatingStars
              rating={formData.rating}
              hoverRating={hoverRating}
              onRate={handleRateChange}
              onHover={setHoverRating}
            />

            <div className="space-y-2">
              <textarea
                name="comment"
                id="feedback"
                rows={4}
                value={formData.comment}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none text-gray-700"
                placeholder="Dites-nous en plus..."
              />
            </div>

            <div className="space-y-3 pt-2">
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={formData.rating === 0 || isPendingAddFeedback}
              >
                {isPendingAddFeedback ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verification...
                  </span>
                ) : (
                  <span key="loading-state" className="flex items-center gap-2">
                    Soumettre
                  </span>
                )}

              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full py-3"
                onClick={closeFeedback}
              >
                Annuler
              </Button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="bottom-center" />
    </div>
  );
}