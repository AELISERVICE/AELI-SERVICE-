import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { LoginScreen } from './screens/LoginScreen'
import { RegisterScreen } from './screens/RegisterScreen'
import { OtpScreen } from './screens/OtpScreen'
import { Base } from './screens/Base'
import { Profile } from './screens/profile'
import { Shearch } from './screens/Recherche'
import { Provider } from './screens/provider'
import { Home } from './screens/home'
import { RegistrationProviderScreen } from './screens/RegistrationProviderScreen'
import { AddServiceScreen } from "./screens/AddServiceScreen"
import { SubscriptionScreen } from "./screens/SubscriptionScreen"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/otp" element={<OtpScreen />} />
      <Route path="/become-service-provider" element={<RegistrationProviderScreen />} />
      <Route path="/add-service" element={<AddServiceScreen />} />


      {/* Toutes ces routes seront injectées dans le composant Base */}
      <Route element={<Base />}>
        <Route path="/accueil" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/recherche" element={<Shearch />} />
        <Route path="/prestataire" element={<Provider />} />
        <Route path="/subscription" element={<SubscriptionScreen />} />
      </Route>
    </Routes>
  )
}

export default App
