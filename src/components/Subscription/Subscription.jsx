import React, { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import { Check, Loader2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { useGetPlans, useSubscribe } from '../../hooks/useSouscription';
import { useInfoUserConnected } from '../../hooks/useUser';


export function Subscription() {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const { data: response } = useGetPlans();
    const plansFromApi = response?.data?.plans;
    const { mutate: subscribe, isPending, isSuccess, isError, data: dataSubscribe, error } = useSubscribe();
    const { data: userData } = useInfoUserConnected();
    const provider = userData?.data?.provider?.id;


    const handleSubscribe = (tier) => {
        setSelectedPlan(tier.id);

        // Construction de l'objet selon la doc
        const paymentData = {
            amount: tier.price,
            type: "subscription",
            providerId: provider, // Ton id récupéré de userData
            description: `Abonnement ${tier.name}`
        };

        // On passe l'objet complet au mutate
        subscribe(paymentData);
    };


    useEffect(() => {
        if (isSuccess && dataSubscribe?.success) {
            toast.success(dataSubscribe.message);

            if (dataSubscribe.payment?.paymentUrl) {
                window.location.href = dataSubscribe.payment.paymentUrl;
            }
        }

        if (isError) {
            const mainMessage = error?.message;
            toast.error(mainMessage);

            const backendErrors = error?.response?.errors;
            if (Array.isArray(backendErrors)) {
                backendErrors.forEach((err) => {
                    toast.info(err.message);
                });
            }
        }

    }, [isSuccess, isError, dataSubscribe, error]);

    const tiers = [
        {
            id: 'monthly',
            name: 'Mensuel',
            price: plansFromApi?.monthly?.price || 0,
            currency: plansFromApi?.monthly?.currency,
            description: plansFromApi?.monthly?.description || 'Abonnement mensuel',
            features: ['Accès complet 30 jours', 'Support standard', '1 profil prestataire'],
        },
        {
            id: 'quarterly',
            name: 'Trimestriel',
            price: plansFromApi?.quarterly?.price || 0,
            currency: plansFromApi?.quarterly?.currency || 'XAF',
            description: plansFromApi?.quarterly?.description || 'Abonnement trimestriel',
            isRecommended: true,
            features: ['Économisez 20%', 'Support prioritaire', 'Badge certifié', 'Statistiques'],
        },
        {
            id: 'yearly',
            name: 'Annuel',
            price: plansFromApi?.yearly?.price || 0,
            currency: plansFromApi?.yearly?.currency || 'XAF',
            description: plansFromApi?.yearly?.description || 'Meilleur prix annuel',
            features: ['Support 24/7', 'Mise en avant VIP', 'Zéro commissions sur vos ventes'],
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 items-start">
            {tiers.map((tier) => (
                <div
                    key={tier.id}
                    className={`relative rounded-3xl p-8 flex flex-col h-full transition-all duration-300 hover:-translate-y-1 ${tier.isRecommended
                        ? 'bg-[#8B5CF6] text-white shadow-xl shadow-purple-200'
                        : 'bg-white text-gray-800 shadow-sm hover:shadow-md'
                        }`}
                >
                    {tier.isRecommended && (
                        <div className="absolute -top-4 right-8 bg-[#FFDBB9] text-[#8B5CF6] px-4 py-1.5 rounded-full text-sm font-semibold shadow-sm">
                            Recommandé
                        </div>
                    )}

                    <div className="mb-8">
                        <h3 className={`text-sm font-bold tracking-wider uppercase mb-4 ${tier.isRecommended ? 'text-purple-200' : 'text-red-400'}`}>
                            {tier.name}
                        </h3>
                        <div className="flex items-baseline gap-1 mb-3">
                            <span className="text-3xl font-bold">
                                {tier.price?.toLocaleString()} {tier.currency}
                            </span>
                        </div>
                        <p className={`text-sm leading-relaxed ${tier.isRecommended ? 'text-purple-100' : 'text-gray-500'}`}>
                            {tier.description}
                        </p>
                    </div>
                    <div className="mb-8 flex-1">
                        <h4 className={`text-sm font-semibold mb-6 ${tier.isRecommended ? 'text-white' : 'text-gray-900'}`}>
                            Avantages
                        </h4>
                        <ul className="space-y-4">
                            {tier.features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${tier.isRecommended ? 'bg-white/20' : 'bg-green-100'}`}>
                                        <Check size={12} className={tier.isRecommended ? 'text-white' : 'text-green-600'} strokeWidth={3} />
                                    </div>
                                    <span className={`text-sm ${tier.isRecommended ? 'text-purple-50' : 'text-gray-500'}`}>
                                        {feature}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <Button
                        variant={tier.isRecommended ? "gradient" : "softRed"}
                        size="lg"
                        className="w-full"
                        disabled={isPending && selectedPlan === tier.id}
                        onClick={() => handleSubscribe(tier)}
                    >
                        {isPending && selectedPlan === tier.id ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Traitement...
                            </span>
                        ) : (
                            <span key="loading-state" className="flex items-center gap-2">
                                Soumettre
                            </span>
                        )}
                    </Button>
                </div>
            ))}
        </div>
    );
}