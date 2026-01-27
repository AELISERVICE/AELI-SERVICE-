import React from 'react'
import { Check } from 'lucide-react'
import { Button } from './Button' // Ajuste le chemin selon ton dossier

export function PricingCard({ name, price, description, features = [], isRecommended = false }) {
  return (
    <div
      className={`relative rounded-3xl p-8 flex flex-col h-full transition-transform duration-300 hover:-translate-y-1 ${isRecommended
        ? 'bg-[#8B5CF6] text-white shadow-xl shadow-purple-200'
        : 'bg-white text-gray-800 shadow-sm hover:shadow-md'
        }`}
    >
      {isRecommended && (
        <div className="absolute -top-4 right-8 bg-[#FFDBB9] text-[#8B5CF6] px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm">
          Recommended
        </div>
      )}

      <div className="mb-8">
        <h3 className={`text-sm font-bold tracking-wider uppercase mb-4 ${isRecommended ? 'text-purple-200' : 'text-red-400'}`}>
          {name}
        </h3>
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-3xl font-bold">{price}</span>
        </div>
        <p className={`text-sm leading-relaxed ${isRecommended ? 'text-purple-100' : 'text-gray-500'}`}>
          {description}
        </p>
      </div>

      <div className="mb-8 flex-1">
        <h4 className={`text-sm font-semibold mb-6 ${isRecommended ? 'text-white' : 'text-gray-900'}`}>
          Benefits
        </h4>
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${isRecommended ? 'bg-white/20' : 'bg-green-100'}`}>
                <Check size={12} className={isRecommended ? 'text-white' : 'text-green-600'} strokeWidth={3} />
              </div>
              <span className={`text-sm ${isRecommended ? 'text-purple-50' : 'text-gray-500'}`}>
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        variant={"softRed"}
        size="lg"
        className="w-full"
      >
        Learn more
      </Button>
    </div>
  )
}