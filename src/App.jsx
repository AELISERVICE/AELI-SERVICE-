import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Login } from './screens/login'
import { Register } from './screens/register'
import { Base } from './screens/Base'
import { Profile } from './screens/profile'
import { Shearch } from './screens/Recherche'
import { Provider } from './screens/provider'
import { Home } from './screens/home'
import { RegistrationProviderScreen } from './screens/RegistrationProviderScreen'
import {AddServiceScreen} from "./screens/AddServiceScreen";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/become-service-provider" element={<RegistrationProviderScreen />} />
      <Route path="/add-service" element={<AddServiceScreen />} />

      {/* Toutes ces routes seront injectées dans le composant Base */}
      <Route element={<Base />}>
        <Route path="/accueil" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/recherche" element={<Shearch />} />
        <Route path="/prestataire" element={<Provider />} />
      </Route>
    </Routes>
  )
}

export default App
