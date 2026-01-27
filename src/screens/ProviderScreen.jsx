import React, { useState } from 'react'
import { StatsProvider } from '../components/provider/StatsProvider'
import { ServiceProvider } from "../components/provider/ServiceProvider";


export function ProviderScreen() {
    return (
        <main className="flex-1 flex flex-col xl:flex-row h-screen overflow-hidden">
            <div className="flex-1 h-full overflow-y-auto p-4 md:p-2">
                <div className="mx-auto">
                    <ServiceProvider />
                </div>
            </div>

            <div className="xl:h-full xl:overflow-y-auto border-t xl:border-t-0 xl:border-l border-gray-100 bg-white">
                <StatsProvider />
            </div>
        </main>
    )
}