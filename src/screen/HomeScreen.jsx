

import React from 'react';
import { SocialSidebar } from '../components/SocialSidebar';
import { HeroSection } from '../components/HeroSection';
import { FeatureCards } from '../components/FeatureCards';


export function HomeScreen() {
    return (
        <div className="w-full min-h-screen bg-white font-poppins relative">
            <main>
                <HeroSection />
                <FeatureCards />
                <SocialSidebar />
            </main>
        </div>
    )
}
