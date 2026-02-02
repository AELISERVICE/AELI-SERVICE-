import React, { useState } from "react";
import { Star } from "lucide-react";
import { RatingStars } from "../../ui/RatingStars";
import { Button } from "../../ui/Button"; // Import de ton composant UI

export function FeedbackCard({ closeFeedback }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div
      onClick={() => closeFeedback()}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm h-screen flex flex-col justify-center items-center z-20 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 sm:p-8 md:p-10">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=1000"
                alt="Sarah"
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
              <span className="font-semibold text-gray-900">Sarah Johnson</span> ?
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <RatingStars
              rating={rating}
              hoverRating={hoverRating}
              onRate={setRating}
              onHover={setHoverRating}
            />

            <div className="space-y-2">
              <textarea
                id="feedback"
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                placeholder="Dites-nous en plus..."
              />
            </div>

            <div className="space-y-3 pt-2">
              {/* Utilisation de ton Button variant gradient */}
              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={rating === 0 || isSubmitting}
              >
                {isSubmitting ? "Envoi en cours..." : "Envoyer l'avis"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="md:hidden w-full py-3"
                onClick={closeFeedback}
              >
                Non merci
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}