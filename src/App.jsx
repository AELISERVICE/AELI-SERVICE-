import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { LoginScreen } from './screens/Login'
import { Base } from './screens/Base'
import { Dashboard } from './screens/Dashboard'
import { Provider } from './screens/Provider'
import { SubscriptionsScreen } from './screens/SubscriptionsScreen'
import { ReviewsScreen } from './screens/ReviewScreen'
import { FeatureProviderScreen } from './screens/FeatureProviderScreen'
import { SecurityScreen } from './screens/SecurityScreen'
import { Users } from './screens/Users'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginScreen />} />

      {/* Toutes ces routes seront injectées dans le composant Base */}
      <Route element={<Base />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/provider" element={<Provider />} />
        <Route path="/subscriptions" element={<SubscriptionsScreen />} />
        <Route path="/moderation" element={<ReviewsScreen />} />
        <Route path="/feature" element={<FeatureProviderScreen />} />
        <Route path="/security" element={<SecurityScreen />} />
        <Route path="/users" element={<Users />} />
      </Route>
    </Routes>
  )
}

export default App
