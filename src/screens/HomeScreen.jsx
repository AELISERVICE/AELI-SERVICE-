import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { RecommendationSection } from "../components/home/RecommendationSection";
import { ServicesSection } from '../components/home/ServicesSection';



export function HomeScreen() {
    const [activeTab, setActiveTab] = useState('service')


    return (
        <div className="w-full ">
            <div className=" pb-4 md:px-2">
                <div className="mt-16">
                    <RecommendationSection />
                </div>
                <div className="mt-16">
                    <ServicesSection />
                </div>
            </div>
            <ToastContainer position="bottom-center" />
        </div>
    )
}