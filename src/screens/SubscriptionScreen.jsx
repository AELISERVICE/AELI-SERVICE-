import React from 'react'
import { PricingCard } from '../ui/PricingCard'

const tiers = [
    {
        name: 'Standard',
        price: '10000 FCFA',
        description: 'An upgrade from the Basic plan. You get more benefits.',
        features: [
            'All the benefits on the basic plan',
            '₦1,000,000 daily transfer limit',
            '7 free transfers every month',
            'Daily Airtime and Data payments up to ₦150,000 / day',
            '1 Month free trial',
        ],
    },
    {
        name: 'Pro',
        price: '15000 FCFA',
        description:
            'An upgrade from the Basic plan. You get more benefits and access.',
        isRecommended: true,
        features: [
            'All the benefits on the basic plan',
            '₦1,000,000 daily transfer limit',
            '7 free transfers every month',
            'Daily Airtime and Data payments up to ₦150,000 / day',
            '7 free transfers every month',
        ],
    },
    {
        name: 'Premium',
        price: '25000 FCFA',
        description: 'An upgrade from the Basic plan. You get more benefits.',
        features: [
            'All the benefits on the basic plan',
            '₦1,000,000 daily transfer limit',
            '7 free transfers every month',
            'Daily Airtime and Data payments up to ₦150,000 / day',
            '7 free transfers every month',
        ],
    },
]

export function SubscriptionScreen() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 items-start">
            {tiers.map((tier) => (
                <PricingCard key={tier.name} {...tier} />
            ))}
        </div>
    )
}
