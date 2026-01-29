import { Phone, ArrowLeft } from 'lucide-react'
import { Avatar } from '../../../ui/Avatar'
import { messages } from './data'




export function ChatWindow({ contact, onBack }) {
    if (!contact) return <div className="flex-1 flex items-center justify-center text-gray-400">Sélectionnez une discussion</div>;

    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 z-20">
                <div className="flex items-center">
                    <button onClick={onBack} className="mr-3 p-2 md:hidden text-gray-600 hover:bg-gray-100 rounded-full"><ArrowLeft size={20} /></button>
                    <Avatar src={contact.avatar} alt={contact.name} isOnline={contact.isOnline} />
                    <div className="ml-3">
                        <h2 className="text-base font-bold text-gray-900">{contact.name}</h2>
                        <p className="text-[10px] text-green-500 font-medium">Actif maintenant</p>
                    </div>
                </div>
                <button className="p-2.5 text-gray-900 hover:bg-gray-100 rounded-full transition-colors"><Phone size={20} fill="currentColor" /></button>
            </header>

            <div className="flex-1 overflow-y-auto md:pl-6 space-y-8 no-scrollbar">
                {messages.map((msg) => {
                    const isMe = msg.senderId === 'me'
                    return (
                        <div key={msg.id} className="flex items-start max-w-3xl">
                            <Avatar src={isMe ? 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100' : contact.avatar} size="md" />
                            <div className="ml-4 flex-1">
                                <div className="flex items-baseline mb-1 gap-2">
                                    <span className="font-bold text-gray-900 text-sm">{isMe ? 'Moi' : contact.name}</span>
                                    <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
                                </div>
                                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap bg-white p-3 rounded-2xl rounded-tl-none">
                                    {msg.text}
                                </div>
                                {msg.hasActionButton && (
                                    <button className="mt-4 px-6 py-1.5 rounded-full border border-purple-400 text-purple-600 text-xs font-bold hover:bg-purple-50">Contacter</button>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}