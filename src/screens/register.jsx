import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '../ui/Input'
import { Footer } from '../components/global/footer'
import { Button } from '../ui/Button'

export function Register() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen w-full bg-slate-50 font-sans text-slate-900 selection:bg-purple-100 selection:text-purple-900">
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-100 via-slate-50 to-white opacity-60"></div>

      <div className="flex flex-col items-center justify-center min-h-screen w-full">
        {/* Main Content Container */}
        <main className="w-full  px-4 py-4 flex flex-col items-center ">
          {/* Dark Header Section */}
          <div className="w-full  bg-slate-700 rounded-3xl min-h-[400px] p-8 pb-32 md:pb-48 text-center relative overflow-hidden shadow-lg">
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Content de te voir!
              </h1>
              <p className="text-slate-300 text-sm md:text-base max-w-md mx-auto">
                Utilisez ce formulaires pour vous inscrire
              </p>
            </div>
            {/* Abstract background shape for header */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 right-0 w-48 h-48 bg-purple-400 rounded-full blur-3xl"></div>
            </div>
          </div>

          {/* Floating Form Card */}
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl -mt-24 md:-mt-50 relative z-20 p-6 md:p-10 lg:p-12 border border-slate-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Inscription
              </h2>
              <p className="text-slate-500 text-sm">
                Entrez vos informations afin de vous inscrire
              </p>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column Fields */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Input
                      label="Nom"
                      type="text"
                      placeholder="Nom"
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      label="Prenom"
                      type="text"
                      placeholder="Prenom"
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      label="Genre"
                      type="select"
                      options={[
                        {
                          value: 'homme',
                          label: 'homme',
                        },
                        {
                          value: 'femme',
                          label: 'femme',
                        },
                        {
                          value: 'autre',
                          label: 'autre',
                        },
                      ]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      label="Mot de passe"
                      type="password"
                      placeholder="*******"
                    />
                  </div>
                </div>

                {/* Right Column Fields */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Input
                      label="Pays"
                      type="text"
                      placeholder="cameroun"
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      label="Email"
                      type="email"
                      placeholder="exemple@gmail.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      label="Telephne"
                      type="number"
                      placeholder="692 033 745"
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      label="Confirmer mot de passe"
                      type="password"
                      placeholder="*******"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 space-y-4 md:w-1/2 md:ml-auto">
                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                >
                  Confirmer
                </Button>

                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <span className="relative bg-white px-4 text-sm text-slate-500">
                    Ou
                  </span>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  className="w-full gap-2 py-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span >Google</span>
                </Button>

                <div className="text-center pt-2">
                  <p className="text-sm text-slate-500">
                    Vous avez déjà un compte?{' '}
                    <a
                      onClick={() => navigate('/login')}
                      className="text-purple-600 font-semibold hover:text-purple-700 hover:underline"
                    >
                      Se connecter
                    </a>
                  </p>
                </div>
              </div>
            </form>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}
