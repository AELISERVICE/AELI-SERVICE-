import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { LoginScreen } from './screens/LoginScreen'
import { RegisterScreen } from './screens/RegisterScreen'
import { OtpScreen } from './screens/OtpScreen'
import { Base } from './screens/Base'
import { HomeScreen } from './screens/HomeScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { SearchScreen } from './screens/SearchScreen'
import { ProviderScreen } from './screens/ProviderScreen'
import { RegistrationProviderScreen } from './screens/RegistrationProviderScreen'
import { AddCategorycreen } from './screens/AddCategory'
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
      <Route path="/add-category" element={<AddCategorycreen />} />
      <Route path="/add-service" element={<AddServiceScreen />} />

      {/* Toutes ces routes seront injectées dans le composant Base */}
      <Route element={<Base />}>
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/search" element={<SearchScreen />} />
        <Route path="/provider" element={<ProviderScreen />} />
        <Route path="/subscription" element={<SubscriptionScreen />} />
      </Route>
    </Routes>
  )
}

export default App
