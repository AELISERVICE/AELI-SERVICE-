import React, { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, X, Check, MapPin, Loader2 } from 'lucide-react';
import { SectionHeader } from '../../ui/SectionHeader';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { FormCard } from '../../ui/FormCard';
import { TermsSection } from "./TermsSection";
import { MapPicker } from '../global/MapPicker';
import { useInfoUserConnected } from '../../hooks/useUser';
import { useApplyProvider } from '../../hooks/useProvider';


const availableActivities = [
    "Ménage", "Plomberie", "Électricité", "Jardinage",
    "Coiffure", "Esthétique", "Mécanique", "Cours d'appui"
]


export function ProviderInfoForm() {
    const navigate = useNavigate()
    const [agreed, setAgreed] = useState(false)
    const [showMapModal, setShowMapModal] = useState(false)
    const { data: userData } = useInfoUserConnected();
    const { mutate, isPending, isError, error, isSuccess, data } = useApplyProvider();
    const user = userData?.data?.user;

    const [formData, setFormData] = useState({
        firstName: user?.firstName,
        lastName: user?.lastName,
        gender: user?.gender,
        country: user?.country,
        email: user?.email,
        phone: user?.phone,
        cniNumber: '',
        imgcnirecto: null,
        imgcniverso: null,
        photos: null,
        businessContact: '',
        whatsapp: '',
        businessName: '',
        location: '',
        address: '',
        latitude: '',
        longitude: '',
        description: '',
        activities: []
    })

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                gender: user.gender || '',
                country: user.country || '',
                email: user.email || '',
                phone: user.phone || ''
            }));
        }
    }, [user]);

    const isInvalid = [
        formData.firstName,
        formData.lastName,
        formData.gender,
        formData.country,
        formData.email,
        formData.phone,
        formData.cniNumber,
        formData.imgcnirecto,
        formData.imgcniverso,
        formData.photos,
        formData.businessContact,
        formData.businessName,
        formData.location,
        formData.latitude,
        formData.longitude,
        formData.description
    ].some(value => !value) || formData.activities.length === 0;

    // Ajouter une activité
    const handleAddActivity = (e) => {
        const selected = e.target.value
        if (selected && !formData.activities.includes(selected)) {
            setFormData(prev => ({
                ...prev,
                activities: [...prev.activities, selected]
            }))
        }
        // Reset le select après sélection
        e.target.value = ""
    }

    // Supprimer une activité
    const removeActivity = (activityToRemove) => {
        setFormData(prev => ({
            ...prev,
            activities: prev.activities.filter(act => act !== activityToRemove)
        }))
    }

    const handleConfirmLocation = (mapData) => {
        setFormData(prev => ({
            ...prev,
            location: mapData.address,
            latitude: mapData.lat,
            longitude: mapData.lon
        }))
        setShowMapModal(false)
    }

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const dataToSend = new FormData();

        Object.keys(formData).forEach(key => {
            if (key === 'activities') {
                dataToSend.append(key, JSON.stringify(formData[key]));
            } else if (['imgcnirecto', 'imgcniverso', 'photos'].includes(key)) {
                if (formData[key]) dataToSend.append(key, formData[key]);
            } else {
                dataToSend.append(key, formData[key]);
            }
        });


        // --- AFFICHAGE EN CONSOLE ---
        console.log("--- Contenu du FormData envoyé ---");
        for (let [key, value] of dataToSend.entries()) {
            // Si c'est un fichier, on affiche son nom pour plus de clarté
            if (value instanceof File) {
                console.log(`${key}: [Fichier] ${value.name} (${value.size} octets)`);
            } else {
                console.log(`${key}:`, value);
            }
        }

        mutate(dataToSend);
    };

    useEffect(() => {
        if (isSuccess && data?.success) {
            toast.success(data.message);
            navigate(-1);
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

    }, [isSuccess, isError, data, error]);

    return (
        <FormCard
            title="Inscription Prestataire"
            subtitle="Veuillez remplir toutes les informations requises pour compléter votre inscription"
        >
            <form
                onSubmit={handleSubmit}
                className="space-y-10"
            >
                <section>
                    <SectionHeader
                        icon={User}
                        title="Informations Personnelles"
                        colorClass="text-blue-600"
                    />
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <Input
                            name="firstName"
                            label="Nom"
                            placeholder="Nom"
                            value={formData.firstName}
                            onChange={handleChange}
                            isreadOnly={true}
                            required
                            readOnly
                        />
                        <Input
                            name="lastName"
                            label="Prénom"
                            placeholder="Prénom"
                            value={formData.lastName}
                            onChange={handleChange}
                            isreadOnly={true}
                            required
                            readOnly
                        />
                        <Input
                            name="gender"
                            label="Genre"
                            placeholder="Femme"
                            value={formData.gender}
                            onChange={handleChange}
                            isreadOnly={true}
                            required
                            readOnly
                        />
                        <Input
                            name="email"
                            label="Adresse E-mail"
                            type="email"
                            placeholder="email@exemple.com"
                            value={formData.email}
                            onChange={handleChange}
                            isreadOnly={true}
                            required
                            readOnly
                        />
                        <Input
                            name="phone"
                            label="Téléphone"
                            type="tel"
                            placeholder="6xx xxx xxx"
                            value={formData.phone}
                            onChange={handleChange}
                            isreadOnly={true}
                            required
                            readOnly
                        />
                    </div>
                </section>
                <section>
                    <SectionHeader
                        icon={Briefcase}
                        title="Informations sur la Structure"
                        colorClass="text-purple-600"
                    />
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="flex flex-col gap-6">
                            <Input
                                name="cniNumber"
                                label="Numéro CNI"
                                placeholder="CNI"
                                onChange={handleChange}
                                required
                            />
                            <div className="flex flex-col md:flex-row gap-6">
                                <Input
                                    name="imgcnirecto"
                                    label="Photo CNI Recto"
                                    type="file"
                                    onChange={handleChange}
                                    required
                                    className="h-[150px]"
                                />
                                <Input
                                    name="imgcniverso"
                                    label="Photo CNI Verso"
                                    type="file"
                                    onChange={handleChange}
                                    required
                                    className="h-[150px]"
                                />
                            </div>
                        </div>
                        <Input
                            name="photos"
                            label="Photo / Logo"
                            type="file"
                            onChange={handleChange}
                            required
                            className="h-[250px]"
                        />
                        <Input
                            name="businessName"
                            label="Entreprise"
                            placeholder="Nom structure"
                            onChange={handleChange}
                            required
                        />
                        <Input
                            name="businessContact"
                            label="Contact Pro"
                            type="number"
                            placeholder="6xx xxx xxx"
                            onChange={handleChange}
                            required
                        />
                        <Input
                            name="whatsapp"
                            label="Contact whatsapp"
                            type="number"
                            placeholder="6xx xxx xxx"
                            onChange={handleChange}
                            required
                        />
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-gray-700">Localisation <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <Input
                                    name="location"
                                    placeholder="Choisissez sur la carte..."
                                    value={formData.location}
                                    isreadOnly={true}
                                    readOnly // Empêche la saisie manuelle pour forcer la précision carte
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="softRed"
                                    onClick={() => setShowMapModal(true)}
                                    className="h-[49px]"
                                >
                                    <MapPin size={18} />
                                    Carte
                                </Button>
                            </div>
                        </div>
                        {/* --- MODAL DE LA CARTE --- */}
                        {showMapModal && (
                            <MapPicker
                                onClose={() => setShowMapModal(false)}
                                onConfirm={handleConfirmLocation}
                            />
                        )}
                        <Input
                            name="address"
                            label="Address (optionel)"
                            placeholder="6xx xxx xxx"
                            onChange={handleChange}
                            className="flex-1"
                        />
                        <div className="space-y-3">
                            <Input
                                name="activities"
                                label="Sélectionner vos activités"
                                type="select"
                                onChange={handleAddActivity}
                                required
                                options={[
                                    { value: '', label: 'Choisir une activité...' },
                                    ...availableActivities
                                        .filter(act => !formData.activities.includes(act))
                                        .map(act => ({ value: act, label: act }))
                                ]}
                            />

                            {/* Affichage des tags (activités sélectionnées) */}
                            <div className="flex flex-wrap gap-2">
                                {formData.activities.map((act) => (
                                    <span
                                        key={act}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-[#E8524D]/10 text-[#E8524D] text-sm font-medium rounded-full border border-[#E8524D]/20 animate-in zoom-in duration-200"
                                    >
                                        {act}
                                        <button
                                            type="button"
                                            onClick={() => removeActivity(act)}
                                            className="hover:bg-[#E8524D]/2 rounded-full p-0.5 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <Input
                            name="description"
                            label="Description "
                            type="textarea"
                            placeholder="Vos services..."
                            onChange={handleChange}
                            required
                        />
                    </div>
                </section>
                <TermsSection
                    agreed={agreed}
                    onToggle={(checked) => setAgreed(checked)}
                />
                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
                    <Button
                        variant="secondary"
                        className="w-full sm:w-auto gap-2 py-3"
                        type="button"
                        onClick={() => navigate(-1)}
                    >
                        <X className="w-4 h-4" />
                        Retour
                    </Button>

                    <Button
                        variant="gradient"
                        type="submit"
                        className="w-full sm:w-auto gap-2 py-3"
                        disabled={!agreed || isInvalid || isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" size={18} />
                                <span>Envoi...</span>
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                <span>Soumettre</span>
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </FormCard>
    )
}