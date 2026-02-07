import React, { useState } from 'react';
import { Flag, ArrowRight, Star, Eye, EyeOff, Check, Trash2 } from 'lucide-react'
import { Button } from '../../ui/Button'
import { Card } from '../../ui/Card'


const reviews = [
    {
        id: '#REV-2024-001',
        isFlagged: true,
        priority: 'High',
        flagReason: 'Inappropriate language',
        reportCount: 3,
        user: {
            name: 'Anonymous User',
            avatar:
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            targetName: 'Traiteur Fatou',
            rating: 1,
            date: 'Yesterday',
        },
        content:
            'Nul à chier, arnaque totale !!! 💩💩💩 Service déplorable, je ne recommande absolument pas. Vraiment décevant.',
        status: 'visible',
        reportTags: ['Inappropriate Language', 'Offensive Content'],
    },
    {
        id: '#REV-2024-002',
        isFlagged: false,
        user: {
            name: 'Fatou M.',
            avatar:
                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            targetName: 'Salon Marie',
            rating: 5,
            date: '5 days ago',
        },
        content:
            "Marie est très professionnelle et à l'écoute. Le résultat est exactement ce que je voulais ! Je recommande vivement. 🖤",
        status: 'visible',
    },
    {
        id: '#REV-2024-003',
        isFlagged: false,
        user: {
            name: 'Aminata D.',
            avatar:
                'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            targetName: 'Salon Marie',
            rating: 4,
            date: '2 weeks ago',
        },
        content:
            "Bon travail, je recommande. L'équipe est sympathique et le résultat est satisfaisant.",
        status: 'visible',
    },
]

export function ReviewsList() {

    return (
        <div className="mx-auto">
            {/* Liste des avis */}
            <div className="space-y-4">

                {reviews.map((item) => (

                    <Card
                        noPadding={true}
                        variant="defaultnobg"
                        className={`${item.isFlagged ? 'bg-red-50 border-red-100' : 'bg-white'}`}
                    >
                        {/* Flagged Header */}
                        {item.isFlagged && (
                            <div className="px-6 pt-6 pb-2 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-red-100 rounded-full shrink-0">
                                        <Flag className="w-5 h-5 text-red-600 fill-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-red-700 font-bold text-base uppercase tracking-wide">
                                            Flagged Review
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-0.5 flex items-center gap-2">
                                            <span className="font-medium">
                                                {item.reportCount} reports
                                            </span>
                                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                            <span>{item.flagReason}</span>
                                        </p>
                                    </div>
                                </div>
                                {item.priority === 'High' && (
                                    <span className="text-xs font-bold text-red-600 tracking-wider uppercase bg-white/50 px-2 py-1 rounded self-start">
                                        High Priority
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="p-6">
                            {/* User Info Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
                                <img
                                    src={item.user.avatar}
                                    alt={item.user.name}
                                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                />
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                                    <span className="font-bold text-gray-900">{item.user.name}</span>
                                    <ArrowRight className="w-3 h-3 text-gray-400" />
                                    <span className="text-gray-600">{item.user.targetName}</span>

                                    <div className="flex items-center gap-0.5 ml-1 sm:ml-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-3.5 h-3.5 ${star <= item.user.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                            />
                                        ))}
                                        <span className="ml-1 text-gray-500 font-medium">
                                            {item.user.rating}/5
                                        </span>
                                    </div>

                                    <span className="text-gray-400 ml-1 sm:ml-2 text-xs">
                                        {item.user.date}
                                    </span>
                                </div>
                            </div>

                            {/* Review Content */}
                            <div className="bg-white/50 p-4 rounded-lg border border-black/5 mb-4">
                                <p className="text-gray-800 italic leading-relaxed">
                                    "{item.content}"
                                </p>
                            </div>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500 mb-6">
                                {item.isFlagged && (
                                    <div className="flex items-center gap-1.5 text-red-600">
                                        <Flag className="w-3.5 h-3.5 fill-red-600" />
                                        <span>{item.reportCount} Reports</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-1.5 text-gray-600">
                                    {item.status === 'visible' ? (
                                        <Eye className="w-3.5 h-3.5" />
                                    ) : (
                                        <EyeOff className="w-3.5 h-3.5" />
                                    )}
                                    <span className="capitalize">{item.status}</span>
                                </div>

                                <div className="flex items-center gap-1.5 text-gray-400">
                                    <span className="uppercase tracking-wider">ID: {item.id}</span>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-black/5">
                                {/* Left: Tags (only for flagged) */}
                                <div className="flex flex-wrap gap-2">
                                    {item.isFlagged && (
                                        <>
                                            <span className="text-xs text-gray-500 font-medium mr-2 self-center hidden md:inline">
                                                Reports:
                                            </span>
                                            {item.reportTags?.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="px-2.5 py-1 bg-white border border-gray-200 text-gray-600 text-xs rounded-md font-medium"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </>
                                    )}
                                </div>

                                {/* Right: Buttons */}
                                <div className="flex items-center gap-2 self-end md:self-auto w-full md:w-auto justify-end">
                                    {item.isFlagged ? (
                                        <Button className="flex items-center justify-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-semibold rounded-lg transition-colors flex-1 md:flex-none">
                                            <Check className="w-4 h-4" />
                                            Visible
                                        </Button>
                                    ) : (
                                        <Button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold rounded-lg transition-colors flex-1 md:flex-none">
                                            <EyeOff className="w-4 h-4" />
                                            Cacher
                                        </Button>
                                    )}

                                    <Button className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-semibold rounded-lg transition-colors flex-1 md:flex-none">
                                        <Trash2 className="w-4 h-4" />
                                        Supprimer
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};