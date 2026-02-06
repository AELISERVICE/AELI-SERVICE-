import React, { useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MapPin, Star, Eye, MoreVertical, MessageSquare, RotateCcw } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Table } from '../../ui/Table';
import { Badge } from '../../ui/Badge';
import { ActionMenu } from '../global/ActionMenu';

const PROVIDERS = [
    { id: 1, name: 'Salon Marie', location: 'Douala', rating: 4.8, Reviews: 10, View: 22, status: 'Active', contact: '+237...', isFeatured: true, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop' },
    { id: 2, name: 'Beauté Express', location: 'Yaoundé', rating: 4.5, Reviews: 15, View: 35, status: 'Expired', contact: 'Hidden', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=100&h=100&fit=crop' },
    { id: 3, name: 'Salon Marie', location: 'Douala', rating: 4.8, Reviews: 10, View: 22, status: 'Active', contact: '+237...', isFeatured: true, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop' },
    { id: 4, name: 'Beauté Express', location: 'Yaoundé', rating: 4.5, Reviews: 15, View: 35, status: 'Expired', contact: 'Hidden', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=100&h=100&fit=crop' },
    { id: 5, name: 'Salon Marie', location: 'Douala', rating: 4.8, Reviews: 10, View: 22, status: 'Active', contact: '+237...', isFeatured: true, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop' },
    { id: 6, name: 'Beauté Express', location: 'Yaoundé', rating: 4.5, Reviews: 15, View: 35, status: 'Expired', contact: 'Hidden', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=100&h=100&fit=crop' },
];

export const ProviderTable = ({ actifTabs }) => {
    const { onActiveModal } = useOutletContext()
    const [openMenuId, setOpenMenuId] = useState(null)
    const triggerRef = useRef(null)

    const headers = ["Provider", "Location", "Rating", "Reviews", "View", "Status", "Contact", "Actions"];

    return (
        <Card>
            <Table headers={headers}>
                {PROVIDERS.map((item) => (
                    <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                                <img src={item.image} className="h-10 w-10 rounded-lg object-cover" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-900">{item.name}</span>
                                        {item.isFeatured && <span className="bg-purple-50 text-purple-600 text-[10px] px-1.5 py-0.5 rounded">Featured</span>}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                            <div className="flex items-center gap-2"><MapPin size={14} className="fill-red-400 text-white" />{item.location}</div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-1"><Star size={14} className="fill-amber-400 text-amber-400" />{item.rating}</div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-1"><MessageSquare size={14} className="fill-gray-400 text-white" />{item.Reviews}</div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-1"><Eye size={14} className="fill-gray-400 text-white" />{item.View}</div>
                        </td>
                        <td className="px-6 py-4">
                            <Badge
                                status={item.status}
                                variant={item.status === 'Active' ? 'green' : item.status === 'Expired' ? 'red' : 'gray'}
                            />
                        </td>
                        <td className="px-6 py-4">
                            {item.contact === 'Hidden' ? <span className="text-slate-400 italic">Hidden</span> : <span className="text-green-600 font-medium">{item.contact}</span>}
                        </td>
                        <td className="relative px-6 py-4 text-right">
                            {actifTabs === "Supprimer" ? (
                                <Button
                                    size={false}
                                    variant={"recovery"}
                                    onClick={() => onActiveModal(2)}
                                >
                                    <RotateCcw className="w-5 h-5 text-emerald-400 group-hover/btn:text-emerald-300" />
                                </Button>
                            ) : (
                                <Button
                                    ref={openMenuId === item.id ? triggerRef : null}
                                    onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                                    className="ext-slate-400 hover:text-slate-600 border-none">
                                    <MoreVertical size={18} />
                                </Button>
                            )}
                            <ActionMenu
                                isOpen={openMenuId === item.id}
                                onClose={() => setOpenMenuId(null)}
                                triggerRef={triggerRef}
                                onEdit={() => onActiveModal(3)}
                                onDelete={() => onActiveModal(1)}
                            />
                        </td>
                    </tr>
                ))}
            </Table>
        </Card>
    );
};