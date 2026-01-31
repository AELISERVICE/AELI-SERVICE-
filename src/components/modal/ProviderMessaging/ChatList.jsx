import React from 'react'
import { Avatar } from '../../../ui/Avatar'
import { contacts } from './data'


export function ChatList({ onSelectContact, selectedId }) {
    return (
        <div className="flex flex-col h-full md:border-r md:border-gray-200 overflow-hidden">
            <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
                {contacts.map((contact) => {
                    const isSelected = selectedId === contact.id;
                    return (
                        <button key={contact.id} onClick={() => onSelectContact(contact)}
                            className={`w-full flex items-start p-4 transition-all relative text-left hover:bg-white/50 
                            ${isSelected ? 'bg-white' : ''}`}>
                            {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500" />}
                            <Avatar src={contact.avatar} alt={contact.name} isOnline={contact.isOnline} />
                            <div className="ml-3 flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-sm font-bold text-gray-900 truncate">{contact.name}</h3>
                                    <span className="text-[10px] text-gray-400">{contact.lastMessageTime}</span>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2 mt-1">{contact.lastMessage}</p>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}