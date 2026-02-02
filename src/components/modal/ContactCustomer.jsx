import React from 'react'
import { Send, Phone, MessageCircle, X } from 'lucide-react'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'

export function ContactCustomer({ closeContact }) {
  return (
    <div
      onClick={() => closeContact()}
      className="fixed inset-0 z-[100] h-screen overflow-y-auto bg-black/60 backdrop-blur-sm p-4 md:p-8 flex justify-center items-start md:items-center font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 my-auto"
      >
        {/* Main Appointment Card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl relative">
          {/* Gradient Header */}
          <div className=" px-6 py-8 md:px-10">
            <h1 className="text-3xl md:text-3xl font-bold text-gray-700 mb-2 tracking-tight pacifico-regular">
              Prendre rendez-vous
            </h1>
            <p className="text-gray-500 text-sm md:text-base font-medium">
              Contactez Marie pour réserver votre créneau ou poser vos questions
            </p>
          </div>

          {/* Form Content */}
          <form className="p-6 md:p-10 space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nom complet"
                placeholder="Ex: Fatou Kamga"
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="fatou@example.com"
                required
              />
            </div>

            <Input
              label="Téléphone"
              type="tel"
              placeholder="+237 6xx xxx xxx"
            />

            <Input
              label="Message"
              type="textarea"
              placeholder="Décrivez votre besoin..."
              required
              rows={4}
            />

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-4 pt-2 ">
              <Button
                type="button"
                variant="secondary"
                className="flex-1 py-3"
                onClick={closeContact}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="gradient"
                className="flex-[2] gap-2 py-3"
              >
                <Send className="w-4 h-4 " />
                Envoyer la demande
              </Button>
            </div>
          </form>
        </div>

        {/* Contact Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WhatsApp Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="font-bold text-lg text-gray-700  pacifico-regular">WhatsApp</h3>
            </div>
            <p className="text-gray-500 text-sm mb-6 flex-grow">
              Réponse rapide pour vos questions urgentes.
            </p>
            <Button variant="whatsapp" className="w-full gap-2 py-3">
              <MessageCircle className="w-6 h-6" />
              Ouvrir WhatsApp
            </Button>
          </div>

          {/* Direct Call Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col transition-transform hover:-translate-y-1 duration-300">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="font-bold text-lg text-gray-700  pacifico-regular">Appel direct</h3>
            </div>
            <p className="text-gray-500 text-sm mb-6 flex-grow">
              Disponibilité immédiate par téléphone.
            </p>
            <Button variant="phone" className="w-full gap-2 py-3">
              <Phone className="w-6 h-6" />
              Appeler maintenant
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}