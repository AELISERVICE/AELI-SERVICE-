import React, { useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MoreVertical, RotateCcw } from 'lucide-react';
import { ActionMenu } from '../global/ActionMenu';
import { Table } from '../../ui/Table';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';


const LASTUSER = [
    { id: 1, name: 'Salon Marie', subname: 'fanck', gender: 'femme', email: 'john@creative-tim.com', country: 'cameroun', status: 'Active', contact: '+237...', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop' },
    { id: 2, name: 'Beauté Express', subname: 'fanck', gender: 'homme', email: 'john@creative-tim.com', country: 'cameroun', status: 'Active', contact: '+237...', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=100&h=100&fit=crop' },
    { id: 3, name: 'Salon Marie', subname: 'fanck', gender: 'homme', email: 'john@creative-tim.com', country: 'cameroun', status: 'Active', contact: '+237...', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop' },
    { id: 4, name: 'Beauté Express', subname: 'fanck', gender: 'femme', email: 'john@creative-tim.com', country: 'cameroun', status: 'Active', contact: '+237...', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=100&h=100&fit=crop' },
    { id: 5, name: 'Salon Marie', subname: 'fanck', gender: 'homme', email: 'john@creative-tim.com', country: 'cameroun', status: 'Active', contact: '+237...', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop' },
    { id: 6, name: 'Beauté Express', subname: 'fanck', gender: 'homme', email: 'john@creative-tim.com', country: 'cameroun', status: 'Active', contact: '+237...', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=100&h=100&fit=crop' },
];

export const UserTable = ({ actifTabs }) => {
    const headers = ["Provider", "Location", "Rating", "Reviews", "View", "Status", "Contact", "Actions"];
    const { onActiveModal } = useOutletContext()
    const [openMenuId, setOpenMenuId] = useState(null)
    const triggerRef = useRef(null)

    return (
        <Card>
            <Table headers={headers}>
                {LASTUSER.map((item) => (
                    <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                                <img src={item.image} className="h-10 w-10 rounded-lg object-cover" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-900">{item.name}</span>
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                            <div className={`flex items-center rounded-full items-center justify-center gap-2 w-fit py-1 px-2 ${item.gender === "femme" ? "bg-pink-50 text-pink-700" : "bg-blue-50 text-blue-700"}`}>{item.gender}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                            <div className="flex items-center gap-2">{item.email}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                            <div className="flex items-center gap-2">{item.country}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                            <div className="flex items-center gap-2">{item.contact}</div>
                        </td>
                        <td className="px-6 py-4">
                            <Badge
                                status={item.status}
                                variant={item.status === 'Active' ? 'green' : item.status === 'Expired' ? 'red' : 'gray'}
                            />
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