import React from "react"
import { Trash2, Plus } from 'lucide-react';
import { Card } from '../../ui/Card'
import { Button } from '../../ui/Button'

const data = [
    {
        id: '1',
        ip: '192.168.1.100',
        reason: 'Brute force attack',
        duration: '23h left',
    },
    {
        id: '2',
        ip: '10.0.0.50',
        reason: 'Bot detection',
        duration: 'Permanent',
        isPermanent: true,
    },
]

export function BannedIPList() {
    return (
        <Card
            className="w-full"
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Banned IPs</h2>
                <Button
                    icon={Plus}
                    variant={"primary"}
                >
                    Ban IP
                </Button>
            </div>
            <div className="space-y-3 flex-1">
                {data.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between group hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-900">{item.ip}</span>
                            <span className="text-sm text-gray-500">{item.reason}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400">{item.duration}</span>
                            <button className="text-red-500 hover:text-red-700 p-1.5"><Trash2 size={20} /></button>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    )
}