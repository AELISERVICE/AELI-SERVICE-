import React from 'react';
import Skeleton from 'react-loading-skeleton';
import {
    UserIcon, Building2Icon, CheckIcon, XIcon, FileTextIcon,
    EyeIcon, MapPinIcon, GlobeIcon
} from 'lucide-react';
import { Button } from '../../ui/Button';
import { ReadOnlyField } from '../../ui/Input';
import { useProviderApplicationsDetail, useProvidersVerify } from '../../hooks/useProvider';



export function ViewInfoProvider({ closeView, providerData }) {
    const { data: response, isLoading, isError } = useProviderApplicationsDetail(providerData?.id);
    const { mutate: mutateVerifyProvider } = useProvidersVerify();

    const app = response?.data?.application;

    // Helper pour afficher soit la valeur, soit un skeleton
    const renderContent = (value, width = "100%") => {
        return isLoading ? <Skeleton width={width} height={20} /> : (value || "---");
    };

    const getDoc = (type) => app?.documents?.find(d => d.type === type)?.url;

    if (isError) return null;

    return (
        <main
            onClick={closeView}
            className="fixed inset-0 overflow-y-auto bg-black/60 backdrop-blur-sm z-80 py-8 px-4"
        >
            <div className="flex w-full justify-center min-h-full">
                <div onClick={(e) => e.stopPropagation()} className="w-full lg:w-3/4 space-y-8">

                    {/* --- SECTION 1 : INFOS PERSONNELLES --- */}
                    <section className="bg-white rounded-[1.5rem] shadow-sm p-6 md:p-8 border border-white">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <UserIcon size={20} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-2xl font-bold text-zinc-900 pacifico-regular">Identité du postulant</h3>
                            </div>
                            <div className="w-16 h-16">
                                {isLoading ? (
                                    <Skeleton circle height={64} width={64} />
                                ) : (
                                    app?.user?.profilePhoto && <img src={app.user.profilePhoto} className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-sm" alt="profile" />
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ReadOnlyField label="Nom" value={renderContent(app?.firstName)} />
                            <ReadOnlyField label="Prénom" value={renderContent(app?.lastName)} />
                            <ReadOnlyField label="Genre" value={renderContent(app?.gender === 'male' ? 'Homme' : 'Femme', "40%")} />
                            <ReadOnlyField label="Pays" value={renderContent(app?.country, "60%")} />
                            <ReadOnlyField label="E-mail de contact" value={renderContent(app?.email)} />
                            <ReadOnlyField label="Téléphone personnel" value={renderContent(app?.phone)} />
                        </div>
                    </section>

                    {/* --- SECTION 2 : INFOS PROFESSIONNELLES --- */}
                    <section className="bg-white rounded-[1.5rem] shadow-sm p-6 md:p-8 border border-white">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <Building2Icon size={20} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-2xl font-bold text-zinc-900 pacifico-regular">Détails de l'activité</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ReadOnlyField label="Nom de l'activité / Business" value={renderContent(app?.businessName)} />
                            <ReadOnlyField label="Contact Professionnel" value={renderContent(app?.businessContact)} />
                            <ReadOnlyField label="Numéro CNI" value={renderContent(app?.cniNumber)} />
                            <ReadOnlyField label="WhatsApp Business" value={renderContent(app?.whatsapp)} />

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-500 mb-2.5">Activités sélectionnées</label>
                                <div className="flex flex-wrap gap-2">
                                    {isLoading ? (
                                        <Skeleton width={100} height={30} count={3} containerClassName="flex gap-2" />
                                    ) : (
                                        app?.activities?.map((act) => (
                                            <span key={act} className="inline-flex items-center px-3 py-1.5 bg-[#E8524D]/10 text-[#E8524D] text-xs font-bold rounded-full border border-rose-100">{act}</span>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-500 mb-1.5">Description des services</label>
                                <div className="w-full bg-gray-50 border border-gray-100 rounded-xl px-5 py-4 text-zinc-700 text-sm">
                                    {isLoading ? <Skeleton count={3} /> : app?.description}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* --- SECTION 3 : LOCALISATION --- */}
                    <section className="bg-white rounded-[1.5rem] shadow-sm p-6 md:p-8 border border-white">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                <MapPinIcon size={20} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-2xl font-bold text-zinc-900 pacifico-regular">Localisation géographique</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ReadOnlyField label="Adresse complète" value={renderContent(app?.location)} fullWidth />
                            <ReadOnlyField label="Point de repère / Précisions" value={renderContent(app?.address)} />
                            <div className="flex gap-4">
                                <ReadOnlyField label="Latitude" value={renderContent(app?.latitude)} />
                                <ReadOnlyField label="Longitude" value={renderContent(app?.longitude)} />
                            </div>
                        </div>
                    </section>

                    {/* --- SECTION 4 : DOCUMENTS CNI --- */}
                    <section className="bg-white rounded-[1.5rem] shadow-sm p-6 md:p-8 border border-white">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                <FileTextIcon size={20} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-2xl font-bold text-zinc-900 pacifico-regular">Documents CNI</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {['cni_recto', 'cni_verso'].map((type) => (
                                <div key={type} className="space-y-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">{type.replace('_', ' ')}</span>
                                    <div className="group relative bg-gray-100 rounded-2xl overflow-hidden aspect-[16/10] border border-gray-200">
                                        {isLoading ? (
                                            <Skeleton height="100%" />
                                        ) : (
                                            <>
                                                <img src={getDoc(type)} alt={type} className="w-full h-full object-cover" />
                                                <a href={getDoc(type)} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                                                    <EyeIcon size={24} />
                                                    <span className="text-xs font-bold mt-2">Agrandir</span>
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* --- ACTIONS --- */}
                    <div className="bg-white rounded-[1.5rem] shadow-sm p-6 md:p-8 border border-white flex flex-col">
                        <textarea
                            disabled={isLoading}
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-[#E8524D]/20 h-32 resize-none"
                            placeholder="Notes admin..."
                        />
                        <div className="flex flex-col md:flex-row gap-4 mt-8">
                            <Button variant="primary" onClick={closeView} disabled={isLoading} className="w-full py-3 bg-[#E8524D] text-white">
                                <CheckIcon size={18} /> Accepter
                            </Button>
                            <Button variant="danger" onClick={closeView} disabled={isLoading} className="w-full py-3 border-red-200 text-red-600">
                                <XIcon size={18} /> Rejeter
                            </Button>
                            <Button variant="outline" onClick={closeView} className="w-full py-3">
                                Fermer
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}