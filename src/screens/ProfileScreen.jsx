import React from 'react'
import { ProfileSection } from '../components/profile/ProfileSection'
import { ProviderPanel } from '../components/profile/ProviderPanel'

export function ProfileScreen() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
      <div className="lg:col-span-7 xl:col-span-8">
        <ProfileSection />
      </div>
      <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-8">
        <ProviderPanel />
      </div>
    </div>
  )
}
