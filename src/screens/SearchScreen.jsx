import React, { useState } from 'react'
import { ServiceSearch } from '../components/search/ServiceSearch'
import { Button } from '../ui/Button'


export function SearchScreen() {
    const [activeTab, setActiveTab] = useState('service')

    return (
        <div className="w-full">
            <div className="px-6 md:px-2">
                <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <h2 className="text-3xl font-bold text-slate-900">Recherche</h2>
                    <div className="flex self-center rounded-2xl bg-gray-100 p-1 md:self-auto gap-1">
                        <Button
                            variant={activeTab === 'service' ? 'gradient' : 'ghost'}
                            onClick={() => setActiveTab('service')}
                            className={`px-8 transition-all duration-300 ${activeTab === 'service' ? '' : 'text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            Service
                        </Button>
                        <Button
                            variant={activeTab === 'carte' ? 'gradient' : 'ghost'}
                            onClick={() => setActiveTab('carte')}
                            className={`px-8 transition-all duration-300 ${activeTab === 'carte' ? '' : 'text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            Carte
                        </Button>
                    </div>
                </div>
                <ServiceSearch />
            </div>
        </div>
    )
}