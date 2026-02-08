import React from 'react';
import { MapPin, Star, Eye, Phone, MoreVertical, MessageSquare } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Table } from '../../ui/Table';
import { Badge } from '../../ui/Badge';

const PROVIDERS = [
  { id: 1, name: 'Salon Marie', location: 'Douala', rating: 4.8, Reviews: 10, View: 22, status: 'Active', contact: '+237...', isFeatured: true, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop' },
  { id: 2, name: 'Beauté Express', location: 'Yaoundé', rating: 4.5, Reviews: 15, View: 35, status: 'Expired', contact: 'Hidden', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=100&h=100&fit=crop' },
  { id: 3, name: 'Salon Marie', location: 'Douala', rating: 4.8, Reviews: 10, View: 22, status: 'Active', contact: '+237...', isFeatured: true, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop' },
  { id: 4, name: 'Beauté Express', location: 'Yaoundé', rating: 4.5, Reviews: 15, View: 35, status: 'Expired', contact: 'Hidden', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=100&h=100&fit=crop' },
  { id: 5, name: 'Salon Marie', location: 'Douala', rating: 4.8, Reviews: 10, View: 22, status: 'Active', contact: '+237...', isFeatured: true, image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop' },
];


const LASTUSER = [
  { id: 1, name: 'Salon Marie', subname: 'fanck', gender: 'femme', email: 'john@creative-tim.com', country: 'cameroun', status: 'Active', contact: '+237...', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop' },
  { id: 2, name: 'Beauté Express', subname: 'fanck', gender: 'homme', email: 'john@creative-tim.com', country: 'cameroun', status: 'Active', contact: '+237...', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=100&h=100&fit=crop' },
  { id: 3, name: 'Salon Marie', subname: 'fanck', gender: 'homme', email: 'john@creative-tim.com', country: 'cameroun', status: 'Active', contact: '+237...', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop' },
  { id: 4, name: 'Beauté Express', subname: 'fanck', gender: 'femme', email: 'john@creative-tim.com', country: 'cameroun', status: 'Active', contact: '+237...', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=100&h=100&fit=crop' },
  { id: 5, name: 'Salon Marie', subname: 'fanck', gender: 'homme', email: 'john@creative-tim.com', country: 'cameroun', status: 'Active', contact: '+237...', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop' },
];

export const LastusersRegister = () => {
  const headers = ["Provider", "Location", "Rating", "Reviews", "View", "Status", "Contact"];
  const headersUser = ["User", "Gender", "Email", "Country", "Status", "Contact"];

  return (
    <div className="f  mb-2">

      <div className="flex flex-col gap-6 ">
        <Card>
          <div className="px-2 md:px-6 py-2">
            <h3 className="text-lg font-semibold text-gray-800 ">
              5 derniers utilisateurs inscrit
            </h3>
          </div>
          <Table headers={headersUser}>
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
              </tr>
            ))}
          </Table>
        </Card>
        <Card>
          <div className="px-2 md:px-6 py-2">
            <h3 className="text-lg font-semibold text-gray-800 ">
              5 derniers prestaires creer
            </h3>
          </div>

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
                  {item.contact === 'Hidden' ? <span className="text-slate-400 italic">Hidden</span> : <span className="text-green-600 font-medium">{item.contact}</span>}
                </td>
                <td className="px-6 py-4">
                  <Badge
                    status={item.status}
                    variant={item.status === 'Active' ? 'green' : item.status === 'Expired' ? 'red' : 'gray'}
                  />
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </div >

  );
};