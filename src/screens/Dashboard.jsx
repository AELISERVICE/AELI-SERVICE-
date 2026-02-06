import React from "react"
import { Users, Briefcase, ShoppingBag, Star } from 'lucide-react'
import { KpiCount } from '../components/dashboard/KpiCount'
import { PaymentSummary } from '../components/dashboard/PaymentSummary'
import { ContactAnalytics } from '../components/dashboard/ContactAnalytics'
import { ProviderStatusList } from '../components/dashboard/ProviderStatusList'
import { UsersAnalytics } from '../components/dashboard/UsersAnalytics'
import { UserComposition } from '../components/dashboard/UserComposition'
import { LastusersRegister } from '../components/dashboard/LastusersRegister'

export function Dashboard() {
    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Top Stats Row */}
                <KpiCount />

                {/* Middle Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 xl:col-span-4">
                        <PaymentSummary />
                    </div>
                    <div className="lg:col-span-4 xl:col-span-4">
                        <ContactAnalytics />
                    </div>
                    <div className="lg:col-span-3 xl:col-span-4">
                        <ProviderStatusList />
                    </div>
                </div>

                {/* Bottom Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 h-[350px]">
                        <UsersAnalytics />
                    </div>
                    <div className="relative lg:col-span-1 h-[350px] p-2">
                        <img src="./motifbg4.png" alt="" className=" absolute top-0 left-0 rigth-0 h-full rounded-xl" />
                        <UserComposition />
                    </div>
                </div>
                <LastusersRegister />
            </div>
        </div>
    )
}