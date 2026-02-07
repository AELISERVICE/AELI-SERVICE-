import React from 'react';
import { UserIcon, Building2Icon, CheckIcon, XIcon, FileTextIcon, EyeIcon } from 'lucide-react';
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
        description: "Spécialiste en marketing numérique avec plus de 5 ans d'expérience dans l'industrie...",
        cniRecto: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop",
        cniVerso: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop"
    },
    activities: ["Ménage", "Plomberie", "Électricité", "Imobilier", "Import/export"]
};

export function ViewInfoProvider({ closeView }) {

    return (
        <main
            onClick={closeView}
            className="fixed inset-0 overflow-y-auto bg-black/60 backdrop-blur-sm z-80 py-4 px-4"
        >
            <div
                className="flex w-full justify-center min-h-full"

            >
                <div
                    onClick={(e) => e.stopPropagation()}
                    className="w-full lg:w-3/4 items-start">
                    <div className="lg:col-span-8 space-y-8">

                        {/* Carte Personnelle */}
                        <section className="bg-white rounded-[1.5rem] shadow-sm p-6 md:p-8 border border-white">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <UserIcon size={20} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-900 pacifico-regular">Infos personnelles</h3>
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

                        {/* Carte Entreprise + Documents */}
                        <section className="bg-white rounded-[1.5rem] shadow-sm p-6 md:p-8 border border-white">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <Building2Icon size={20} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-900 pacifico-regular">Infos professionnelles</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ReadOnlyField label="Numéro CNI" value={DATA.business.cni} />
                                <ReadOnlyField label="Contact pro" value={DATA.business.contactPro} />
                                <ReadOnlyField label="Nom de l'activité" value={DATA.business.nomActivite} fullWidth />

                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-500 mb-2.5">Activités proposées</label>
                                    <div className="flex flex-wrap gap-2">
                                        {DATA.activities.map((act) => (
                                            <span key={act} className="inline-flex items-center px-3 py-1.5 bg-[#E8524D]/10 text-[#E8524D] text-xs font-bold rounded-full border border-rose-100">
                                                {act}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-500 mb-1.5">Description</label>
                                    <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-zinc-700 text-sm leading-relaxed mb-6">
                                        {DATA.business.description}
                                    </div>
                                </div>

                                {/* --- SECTION PIÈCES JOINTES (CNI) --- */}
                                <div className="col-span-1 md:col-span-2 space-y-4">
                                    <label className="flex items-center gap-2 text-2xl font-bold text-gray-900 pacifico-regular">
                                        <FileTextIcon size={16} className="text-emerald-600" />
                                        Documents d'identité
                                    </label>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Recto */}
                                        <div className="group relative bg-gray-100 rounded-2xl overflow-hidden aspect-video border border-gray-200">
                                            <img src={DATA.business.cniRecto} alt="CNI Recto" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                                                <EyeIcon size={24} />
                                                <span className="text-xs font-bold mt-2">Voir Recto</span>
                                            </div>
                                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tight">Recto</div>
                                        </div>

                                        {/* Verso */}
                                        <div className="group relative bg-gray-100 rounded-2xl overflow-hidden aspect-video border border-gray-200">
                                            <img src={DATA.business.cniVerso} alt="CNI Verso" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                                                <EyeIcon size={24} />
                                                <span className="text-xs font-bold mt-2">Voir Verso</span>
                                            </div>
                                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-tight">Verso</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        {/* --- SECTION valider rejeter--- */}
                        <div className="bg-white rounded-[1.5rem] shadow-sm p-6 md:p-8 border border-white flex flex-col">
                            <div>
                                <label className="block text-2xl font-black text-zinc-400  tracking-widest mb-3 pacifico-regular">Notes admin</label>
                                <textarea className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4 text-sm outline-none transition-all h-32 resize-none" placeholder="Ajouter un commentaire..." />
                            </div>
                            <div className="flex flex-col md:flex-row gap-4 mt-8">
                                <Button
                                    variant="primary"
                                    onClick={closeView}
                                    className="w-full py-3"
                                >
                                    <CheckIcon size={18} />
                                    Accepter
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={closeView}
                                    className="w-full py-3"
                                >
                                    <XIcon size={18} />
                                    Rejeter
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={closeView}
                                    className="w-full py-3"
                                >
                                    Annuler
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}