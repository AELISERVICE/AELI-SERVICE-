import React from 'react'
import { MoreVertical, Mail } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import { BarChart, Bar, ResponsiveContainer, Cell } from 'recharts'
import { Button } from '../../ui/Button' // Vérifie que le chemin vers ton bouton est correct
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

const data = [
  { name: '1-10', value: 65 },
  { name: '11-20', value: 45 },
  { name: '21-30', value: 55 },
  { name: '1-10', value: 55 },
  { name: '11-20', value: 55 },
]

const contacts = [
  {
    name: 'Ava Chen',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    name: 'Zaila Karim',
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
  },
  {
    name: 'Izzy Toledo',
    img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
  },
  {
    name: 'Christine Rob',
    img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
  },
]

export function StatsProvider({ showStats, setHideStats, setShowStats }) {
  const { openMessaging } = useOutletContext()

  return (
    <div className={`
      /* Mode Desktop (xl) */
      xl:static xl:w-[350px] xl:translate-x-0 xl:flex 
      /* Mode Mobile (Drawer) */
      fixed right-0 top-0 h-full w-[85%] sm:w-[400px]
      bg-white xl:bg-transparent transition-transform duration-300 ease-in-out 
      ${showStats ? 'translate-x-0' : 'translate-x-full'}
  `}>
      <div className="flex flex-col h-full w-full relative">
        <Button
          variant="tab"
          size="tab"
          onClick={() => (showStats ? setHideStats() : setShowStats(true))}
          className="xl:hidden fixed bottom-[40%] text-white h-[100px] -left-7 z-10 rounded-tr-none rounded-br-none "
        >
          {showStats ? <ChevronRight size={28} /> : <ChevronLeft size={28} />}
        </Button>

        <div className="flex-1 overflow-y-auto no-scrollbar xl:py-0">
          <aside className="w-full xl:w-full bg-white p-6 flex flex-col gap-8 border-none md:border-2 md:border-gray-100 rounded-4xl xl:shadow-sm hover:shadow-xl transition-all duration-300 group md:mb-10">
            <div className="bg-pink-50/50 rounded-3xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-gray-800">Stats</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical size={20} />
                </button>
              </div>
              <div className="flex flex-col items-center mb-8">
                <div className="w-32 h-32 rounded-full border-4 border-pink-200 flex items-center justify-center relative mb-4">
                  <div className="w-full h-full rounded-full overflow-hidden no-scrollbar">
                    <img
                      src="https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1000"
                      alt="Stats"
                      className="w-full h-full object-cover opacity-80"
                    />
                  </div>
                  <div className="absolute inset-0 border-t-4 border-purple-500 rounded-full rotate-45" />
                </div>
                <h4 className="font-bold text-gray-800">Beautiful eyes</h4>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Continue your learning to as done your target
                </p>
              </div>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                      {data.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index % 2 === 0 ? '#FCE0D6' : '#C4B5FD'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
                  <span>1-10 May</span>
                  <span>11-20 May</span>
                  <span>20-30 May</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800 mb-4">
                Dernière personnes contactées
              </h3>
              <div className="flex flex-col gap-4">
                {contacts.map((contact, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={contact.img}
                        alt={contact.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className="font-medium text-sm text-gray-700">
                        {contact.name}
                      </span>
                    </div>
                    <button
                      onClick={openMessaging}
                      className="px-3 py-1 rounded-full border border-purple-200 text-purple-600 text-xs font-medium hover:bg-purple-50 transition-colors">
                      Consulter
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-auto">
              <Button
                variant="gradient"
                size="lg"
                className="w-full gap-2"
                onClick={openMessaging}
              >
                <Mail size={18} />
                Messagerie
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}