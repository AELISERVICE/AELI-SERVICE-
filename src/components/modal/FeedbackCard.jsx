import React, { useState } from "react";
import { Star } from "lucide-react";
import { RatingStars } from "../../ui/RatingStars";

export function FeedbackCard() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="w-full bg-black/60 backdrop-blur-sm h-screen flex flex-col justify-center items-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-green-500 fill-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-gray-600 mb-6">Your feedback helps us improve.</p>
          <button
            onClick={() => {
              setSubmitted(false);
              setRating(0);
              setFeedback("");
            }}
            className="text-purple-600 font-medium hover:text-purple-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black/60 backdrop-blur-sm h-screen flex flex-col justify-center items-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 sm:p-8 md:p-10">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img
                src="https://cdn.magicpatterns.com/uploads/b7Q3d6XLe8iotcUU5dsR24/image.png"
                alt="Sarah"
                className="w-20 h-20 rounded-full ring-4 ring-white shadow-lg object-cover"
              />
              <div className="absolute -bottom-1 -right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Rate Your Experience
            </h1>
            <p className="text-gray-500 text-sm">
              How was your service with{" "}
              <span className="font-semibold text-gray-900">Sarah Johnson</span>
              ?
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
              <label
                htmlFor="feedback"
                className="block text-sm font-medium text-gray-700"
              >
                Share your feedback (optional)
              </label>
              <textarea
                id="feedback"
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                placeholder="Tell us more..."
              />
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={rating === 0 || isSubmitting}
                className={`w-full py-3.5 rounded-xl text-white font-semibold shadow-lg transition-all 
                ${rating === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-gradient-to-r from-purple-400 to-pink-400 hover:shadow-xl hover:-translate-y-0.5"}`}
              >
                {isSubmitting ? "Submitting..." : "Submit Rating"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
