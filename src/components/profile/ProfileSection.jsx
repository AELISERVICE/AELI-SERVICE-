import React, { use } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../ui/Card'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Badge } from '../../ui/Badge'
import { Mail, CheckCircle2 } from 'lucide-react'


export function ProfileSection() {
    const navigate = useNavigate()


    return (
        <div className="space-y-6">
            {/* Profile Header Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600  to-[#FCE0D6] p-6 text-white shadow-lg">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-black opacity-10 rounded-full blur-2xl"></div>

                <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="relative">
                        <img
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"
                            alt="Alexa Rawles"
                            className="w-20 h-20 rounded-full object-cover border-4 border-white/20 shadow-xl"
                        />
                        <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 border-2 border-purple-600 rounded-full"></div>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-xl font-bold">Alexa Rawles</h2>
                        <p className="text-purple-100 text-sm mb-4">
                            alexarawles@gmail.com
                        </p>
                    </div>

                    <Button
                        variant="secondary"
                        size="sm"
                        className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                    >
                        Modifier
                    </Button>
                </div>
            </div>

            {/* Form Section */}
            <Card className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Input label="Nom" placeholder="Votre nom" defaultValue="Rawles" />
                    <Input
                        label="Prenom"
                        placeholder="Votre prenom"
                        defaultValue="Alexa"
                    />

                    <Input
                        label="Genre"
                        type="select"
                        options={[
                            {
                                value: 'female',
                                label: 'Femme',
                            },
                            {
                                value: 'male',
                                label: 'Homme',
                            },
                            {
                                value: 'other',
                                label: 'Autre',
                            },
                        ]}
                    />

                    <Input
                        label="Pays"
                        type="select"
                        options={[
                            {
                                value: 'fr',
                                label: 'France',
                            },
                            {
                                value: 'us',
                                label: 'United States',
                            },
                            {
                                value: 'uk',
                                label: 'United Kingdom',
                            },
                        ]}
                    />

                    <Input
                        label="Email"
                        type="email"
                        placeholder="exemple@gmail.com"
                        defaultValue="alexarawles@gmail.com"
                    />
                    <Input
                        label="Telephone"
                        type="tel"
                        placeholder="+33 6 00 00 00 00"
                        defaultValue="+237 692074533"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mon adresse email
                        </label>
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    alexarawles@gmail.com
                                </p>
                                <p className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Verified
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <div>
                            <Badge variant="success" className="px-3 py-1.5 text-sm">
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                Active
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
                    <Button
                        onClick={() => navigate("/become-service-provider")}
                        variant="gradient" className="w-full sm:w-auto py-3">
                        Devenir prestataire
                    </Button>
                    <Button
                        onClick={() => navigate("/subscription")}
                        variant="softRed" className="w-full sm:w-auto py-3">
                        Souscrire a un plan
                    </Button>
                </div>
            </Card>
        </div>
    )
}
