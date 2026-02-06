import React, { useState, useEffect } from 'react';
import { MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge'



const PROVIDERS = [
    {
        id: '1',
        name: 'Sarah Connor',
        description:
            'Specialized in cybernetic threat assessment and advanced defense systems. 10+ years of experience.',
        location: 'Los Angeles, CA',
        avatar:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
        status: 'active',
        joinedDate: '2 years ago',
        isVerified: true,
    },
    {
        id: '2',
        name: 'Michael Chen',
        description:
            'Full-stack neural network architect providing comprehensive AI integration services for enterprise clients.',
        location: 'Neo Tokyo, JP',
        avatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150',
        status: 'active',
        joinedDate: '1 year ago',
        isVerified: true,
    },
    {
        id: '3',
        name: 'Elena Rodriguez',
        description:
            'Digital marketing strategist focusing on holographic advertising and virtual reality campaigns.',
        location: 'Chicago, IL',
        avatar:
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150&h=150',
        status: 'active',
        joinedDate: '3 years ago',
        isVerified: false,
    },
]


export const ProviderListItem = ({ setSelectedProvider }) => {
    const [selectedId, setSelectedId] = useState('2');
    const selectedProvider = PROVIDERS.find(item => item.id === selectedId);

    useEffect(() => {
        setSelectedProvider(selectedProvider)
    }, [selectedId])

    return (
        <>
            {
                PROVIDERS.map(item => (
                    <Card
                        key={item.id}
                        variant={selectedId === item.id ? 'active' : 'default'}
                        onClick={() => setSelectedId(item.id)}
                        className="cursor-pointer group transition-transform hover:translate-x-1"
                    >
                        <div className="flex items-start gap-4">
                            <div className="relative">
                                <img src={item.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-slate-100" alt="" />
                                {item.isVerified && <CheckCircle2 className="absolute -bottom-1 -right-1 w-4 h-4 text-[#E8524D] bg-white rounded-full" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className={`font-semibold truncate ${selectedId ? 'text-violet-700' : 'text-slate-800'}`}>{item.name}</h3>
                                    {/* <Badge variant={item.status === 'active' ? 'success' : 'neutral'}>{item.status}</Badge> */}
                                </div>
                                <p className="text-sm text-slate-500 line-clamp-2 mb-3">{item.description}</p>
                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                    <span className="flex items-center gap-1"><MapPin size={12} /> {item.location}</span>
                                    <span className="flex items-center gap-1"><Clock size={12} /> {item.joinedDate}</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))
            }
        </>
    )
};