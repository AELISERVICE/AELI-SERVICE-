import React, { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { ProfileSection } from '../components/profile/ProfileSection';
import { ProviderPanel } from '../components/profile/ProviderPanel';
import { Abonnement } from '../components/profile/Abonnement';


export function ProfileScreen() {
  const [isRole, setIsRole] = useState()
  return (
    <>
      <div className={`grid grid-cols-1 ${isRole === "provider" ? "lg:grid-cols-12" : "lg:grid-cols-1"} gap-6 lg:gap-8 items-start`}>
        <div className="lg:col-span-7 xl:col-span-8">
          <ProfileSection setIsRole={setIsRole} />
        </div>
        {isRole === "provider" &&
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-8">
            <ProviderPanel />
            <Abonnement />
          </div>
        }
      </div>
      <ToastContainer position="bottom-center" />
    </>
  )
}
