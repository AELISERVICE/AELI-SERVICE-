import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  // Column 1
  [
    {
      name: 'Marie T.',
      role: 'Créatrice de mode éthique',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
      quote:
        'Avant AELI Services, mon travail manquait de visibilité. Cette plateforme a littéralement propulsé ma marque auprès d’un public que je n’aurais jamais pu atteindre seule. Un outil indispensable pour nous.',
    },
    {
      name: 'Sophie L.',
      role: 'Consultante en stratégie',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
      quote:
        "La mise en relation avec d'autres entrepreneures via AELI Services est d'une simplicité déconcertante. C'est plus qu'une plateforme, c'est un véritable écosystème de soutien et de croissance.",
    },
    {
      name: "Amélie P.",
      role: 'Artisane bijoutière',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
      quote:
        "AELI Services m'a aidé à professionnaliser mon image. Les clients me contactent désormais avec une confiance totale, car ils savent que je suis sur une plateforme sérieuse.",
    },
  ],
  // Column 2
  [
    {
      name: 'Claire D.',
      role: 'Cliente fidèle',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
      quote:
        'Je ne cherche plus mes prestataires ailleurs. AELI Services me permet de découvrir des talents incroyables dirigés par des femmes passionnées. Qualité et confiance garanties à chaque fois.',
    },
    {
      name: 'Fatou S.',
      role: 'Co-fondatrice Tech',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
      quote:
        'AELI Services a comblé le fossé entre mon expertise technique et le grand public. En deux mois, ma base client a doublé grâce à la visibilité offerte par la plateforme.',
    },
    {
      name: 'Lucie B.',
      role: 'Décoratrice d’intérieur',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face',
      quote:
        'La plateforme est pensée pour mettre en valeur notre savoir-faire. Chaque détail de mon profil a été conçu pour convertir les visiteurs en clients réels.',
    },
  ],
  // Column 3
  [
    {
      name: 'Vanessa G.',
      role: 'Traiteur événementiel',
      avatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face',
      quote:
        'Grâce à AELI Services, j’ai enfin pu présenter mes services de manière élégante et professionnelle. C\'est exactement ce qu\'il manquait à l\'entrepreneuriat féminin ici.',
    },
    {
      name: 'Elena R.',
      role: 'Coach professionnelle',
      avatar:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face',
      quote:
        'Le système de recommandation d\'AELI est incroyable. Mes prospects arrivent déjà qualifiés, ce qui me fait gagner un temps précieux.',
    },
    {
      name: 'Isabelle K.',
      role: 'Cliente & Partenaire',
      avatar:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face',
      quote:
        'Utiliser AELI Services, c\'est soutenir l\'économie locale. C\'est clair, moderne, et très efficace pour trouver des services de qualité.',
    },
  ],
];

function TestimonialCard({ name, role, avatar, quote }) {
  return (
    <div className="relative bg-white border border-[#8B5CF6]/10 rounded-2xl p-6 h-full shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <img
          src={avatar}
          alt={name}
          className="w-10 h-10 rounded-full object-cover border border-gray-100"
        />
        <div>
          <p className="text-gray-900 font-semibold text-sm">{name}</p>
          <p className="text-gray-400 text-xs">{role}</p>
        </div>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed">{quote}</p>
    </div>
  );
}

export function TestimonialWall() {
  const flatTestimonials = testimonials.flat();
  // On double le tableau pour un effet de boucle infini fluide
  const duplicatedTestimonials = [...flatTestimonials, ...flatTestimonials];

  return (
    <section className="py-24 relative overflow-hidden z-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-[#8B5CF6] text-sm font-medium mb-4">
            Testimonials
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Loved by teams everywhere
          </h2>
          <p className="text-gray-500 text-lg">
            See what our customers have to say about their experience.
          </p>
        </div>

        {/* MOBILE: Auto-scrolling Carousel */}
        <div className="flex md:hidden w-full overflow-hidden">
          <motion.div
            className="flex gap-4"
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              duration: 40, // Ajustez cette valeur pour la vitesse
              ease: 'linear',
              repeat: Infinity,
            }}
          >
            {duplicatedTestimonials.map((testimonial, idx) => (
              <div key={idx} className="w-[85vw] flex-shrink-0 py-2">
                <TestimonialCard {...testimonial} />
              </div>
            ))}
          </motion.div>
        </div>

        {/* DESKTOP: Masonry Grid */}
        <div
          className="hidden md:grid grid-cols-3 gap-5 items-start max-h-[700px] overflow-hidden"
          style={{
            maskImage:
              'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
          }}
        >
          {testimonials.map((column, colIdx) => (
            <div
              key={colIdx}
              className="flex flex-col gap-5"
              style={{
                marginTop:
                  colIdx === 1 ? '40px' : colIdx === 2 ? '20px' : '0px',
              }}
            >
              {column.map((testimonial, idx) => (
                <TestimonialCard key={idx} {...testimonial} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}