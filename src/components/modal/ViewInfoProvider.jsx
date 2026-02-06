import React from 'react';
import { UserIcon, Building2Icon, CheckIcon, XIcon, X } from 'lucide-react';
import { Button } from '../../ui/Button';
import { ReadOnlyField } from '../../ui/Input';


const DATA = {
    id: 2,
    personal: {
        nom: "Sarah",
        prenom: "Johnson",
        genre: "Femme",
        pays: "États-Unis",
        email: "sarah.johnson@email.com",
        telephone: "+237 692 904 643",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200",
        job: "Digital Marketer"
    },
    business: {
        cni: "ID123456789",
        contactPro: "+237 692 056 693",
        nomActivite: "Johnson Services Professionnels LLC",
        description: "Spécialiste en marketing numérique avec plus de 5 ans d'expérience dans l'industrie..."
    },
    activities: ["Ménage", "Plomberie", "Électricité", "Imobilier", "Import/export"]
};

export function ViewInfoProvider({ closeView }) {

    return (
        <main
            onClick={closeView}
            className="fixed inset-0 overflow-y-auto bg-black/60 backdrop-blur-sm z-80 py-8 px-4"
        >
            <div
                className="max-w-7xl mx-auto flex items-start justify-center min-h-full"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">

                    {/* COLONNE GAUCHE */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Carte Personnelle */}
                        <section className="bg-white rounded-[1.5rem] shadow-sm p-8 border border-white">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <UserIcon size={20} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900">Informations personnelles</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ReadOnlyField label="Nom" value={DATA.personal.nom} />
                                <ReadOnlyField label="Prénom" value={DATA.personal.prenom} />
                                <ReadOnlyField label="Genre" value={DATA.personal.genre} />
                                <ReadOnlyField label="Pays" value={DATA.personal.pays} />
                                <ReadOnlyField label="E-mail" value={DATA.personal.email} />
                                <ReadOnlyField label="Téléphone" value={DATA.personal.telephone} />
                            </div>
                        </section>

                        {/* Carte Entreprise */}
                        <section className="bg-white rounded-[1.5rem] shadow-sm p-8 border border-white">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <Building2Icon size={20} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900">Informations professionnelles</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ReadOnlyField label="Numéro CNI" value={DATA.business.cni} />
                                <ReadOnlyField label="Contact pro" value={DATA.business.contactPro} />
                                <ReadOnlyField label="Nom de l'activité" value={DATA.business.nomActivite} fullWidth />

                                {/* Section des activités (Badges) */}
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-500 mb-2.5">Activités proposées</label>
                                    <div className="flex flex-wrap gap-2">
                                        {DATA.activities.map((act) => (
                                            <span
                                                key={act}
                                                className="inline-flex items-center px-3 py-1.5 bg-[#E8524D]/10 text-[#E8524D] text-xs font-bold rounded-full border border-rose-100 transition-transform hover:scale-105"
                                            >
                                                {act}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-500 mb-1.5">Description</label>
                                    <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-zinc-700 text-sm leading-relaxed">
                                        {DATA.business.description}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* COLONNE DROITE */}
                    <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-4">
                        <div className="bg-white rounded-[1.5rem] shadow-sm p-8 border border-white flex flex-col">
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="relative">
                                    <img src={DATA.personal.avatar} className="w-24 h-24 rounded-2xl object-cover shadow-md ring-4 ring-white" alt="Avatar" />
                                    <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white" />
                                </div>
                                <h1 className="text-xl font-black text-zinc-900 mt-4">{DATA.personal.nom} {DATA.personal.prenom}</h1>
                                <p className="text-sm text-zinc-400 font-medium">{DATA.personal.job}</p>
                            </div>

                            <div className="space-y-3 mb-8">
                                <Button
                                    key="cancel"
                                    variant="primary"
                                    className="w-full py-3"
                                >
                                    <CheckIcon size={18} /> Accepter
                                </Button>
                                <Button
                                    key="cancel"
                                    variant="danger"
                                    className="w-full py-3"
                                >
                                    <XIcon size={18} /> Rejeter
                                </Button>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Notes admin</label>
                                <textarea className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-rose-500/20 transition-all h-32 resize-none" placeholder="Ajouter un commentaire..." />
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
}