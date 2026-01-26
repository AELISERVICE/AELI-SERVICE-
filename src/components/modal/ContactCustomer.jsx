import React from 'react'
import { Send, Phone, MessageCircle } from 'lucide-react'

export function ContactCustomer({ closeContact }) {
  return (
    <div
      onClick={() => closeContact()}
      className="absolute left-0 right-0 z-20 h-screen overflow-y-auto bg-black/60 backdrop-blur-sm  p-4 md:p-8 lg:p-12 flex justify-center items-start md:items-center font-sans ">
      <div className="w-full max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Main Appointment Card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl mt-0 md:mt-55">
          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-[#8B5CF6] to-[#FDBA74] px-6 py-8 md:px-10 md:py-10">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">
              Prendre rendez-vous
            </h1>
            <p className="text-white/90 text-sm md:text-base font-medium">
              Contactez Marie pour réserver votre créneau ou poser vos questions
            </p>
          </div>

          {/* Form Content */}
          <form
            className="p-6 md:p-10 space-y-6"
            onSubmit={(e) => e.preventDefault()}
          >
            {/* Name & Email Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-bold text-gray-700"
                >
                  Nom complet *
                </label>
                <input
                  id="name"
                  type="text"
                  defaultValue="Fatou Kamga"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-gray-700"
                >
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  defaultValue="fatou@example.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="block text-sm font-bold text-gray-700"
              >
                Téléphone
              </label>
              <input
                id="phone"
                type="tel"
                defaultValue="+237 699 123 456"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>

            {/* Message Field */}
            <div className="space-y-2">
              <label
                htmlFor="message"
                className="block text-sm font-bold text-gray-700"
              >
                Message *
              </label>
              <textarea
                id="message"
                rows={4}
                defaultValue="Bonjour, je voudrais prendre rendez-vous pour une coupe et une coloration. Êtes-vous disponible samedi matin ?"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all duration-200 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-4 pt-2">
              <button
                type="submit"
                className="flex-1 bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                <Send className="w-4 h-4" />
                Envoyer la demande
              </button>
              <button
                type="button"
                className="sm:w-auto px-8 py-3.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all duration-200 active:scale-[0.98]"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>

        {/* Contact Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WhatsApp Card */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg flex flex-col h-full transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-green-100 rounded-xl text-green-600">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">WhatsApp</h3>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-grow">
              Contactez-moi directement sur WhatsApp pour une réponse rapide
            </p>
            <button className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]">
              Ouvrir WhatsApp
            </button>
          </div>

          {/* Direct Call Card */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg flex flex-col h-full transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-100 rounded-xl text-blue-600">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-gray-900">Appel direct</h3>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-grow">
              Appelez-moi directement pour discuter de vos besoins
            </p>
            <button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold py-3 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]">
              Appeler maintenant
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
