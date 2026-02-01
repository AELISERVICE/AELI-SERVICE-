import React, { useState } from 'react'
import { Pagination } from '../components/global/Pagination'
import { RecommendationSection } from "../components/home/RecommendationSection"
import { ServicesSection } from '../components/home/ServicesSection'



export function HomeScreen() {
    const [activeTab, setActiveTab] = useState('service')


    return (
        <div className="w-full ">
            <div className=" pb-4 md:px-2">
                <div className="mt-16">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 tracking-tight ">Recommandations</h2>
                    <RecommendationSection />
                </div>
                <div className="mt-16">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 tracking-tight">Services</h2>
                    <ServicesSection />
                </div>
            </div>
            <Pagination />
        </div>
    )
}