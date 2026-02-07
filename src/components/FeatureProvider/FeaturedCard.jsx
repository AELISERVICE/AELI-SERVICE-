import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { X, Star } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button'




const FEATURED = [
    {
        id: 'f1',
        name: 'Jessica Stark',
        role: 'Interior Designer',
        avatar:
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150',
        expiresIn: '12 days',
    },
    {
        id: 'f2',
        name: 'David Kim',
        role: 'Web Developer',
        avatar:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150',
        expiresIn: '8 days',
    },
    {
        id: 'f3',
        name: 'Amanda Low',
        role: 'Event Planner',
        avatar:
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150',
        expiresIn: '5 days',
    },
]




export const FeaturedCard = () => {
    const { onActiveModal } = useOutletContext()

    return (
        <>
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    Prestations à la une
                </h2>
                <span className="text-sm text-slate-500">{FEATURED.length} actifs</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {
                    FEATURED.map((item) => (
                        <Card className="group" key={item.id}>
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-xl overflow-hidden ring-2 ring-violet-100">
                                        <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-800 text-sm truncate">{item.name}</h4>
                                    <p className="text-xs text-slate-500 truncate mb-1">{item.role}</p>
                                    <div className="inline-block px-2 py-0.5 rounded-md bg-[#E8524D]/8 text-[10px] font-bold text-[#E8524D] uppercase">
                                        Expire dans {item.expiresIn}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-slate-300 hover:text-red-500"
                                        onClick={() => onActiveModal(1)}>
                                        <X size={14} />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                }
            </div>
        </>
    );
};