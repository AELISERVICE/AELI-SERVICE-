import React, { useState } from "react"
import { ButtonTab } from '../../ui/Button'


export function TabButton({ TABS, setActifTabs }) {
    const [activeTab, setActiveTab] = useState(TABS[0]);

    // Return the rendered UI for this component.
    return (
        <div className="inline-flex min-w-auto max-w-full  overflow-x-auto md:w-auto  no-scrollbar gap-1 bg-white/60 backdrop-blur-sm rounded-xl p-1 shadow-sm">
            {TABS.map((item) => (
                <ButtonTab
                    key={item}
                    label={item}
                    isActive={activeTab === item}
                    onClick={() => { setActiveTab(item); setActifTabs(item); }}
                />
            ))}
        </div>
    )
}
