import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import AuthLayout from '@/components/layout/AuthLayout'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import PatientLayout from '@/components/layout/PatientLayout'
import PatientDashboard from '@/pages/patient/Dashboard'
import DoctorLayout from '@/components/layout/DoctorLayout'
import DoctorDashboard from '@/pages/doctor/Dashboard'
import HospitalLayout from '@/components/layout/HospitalLayout'
import HospitalDashboard from '@/pages/hospital/Dashboard'
import ProtectedRoute from '@/components/layout/ProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
        </Route>

        {/* Patient Portal */}
        <Route path="/patient" element={<ProtectedRoute allowedRoles={['patient']} />}>
          <Route element={<PatientLayout />}>
            <Route path="dashboard" element={<PatientDashboard />} />
            {/* Add more patient routes here */}
          </Route>
        </Route>

        {/* Doctor Portal */}
        <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']} />}>
          <Route element={<DoctorLayout />}>
            <Route path="dashboard" element={<DoctorDashboard />} />
            {/* Add more doctor routes here */}
          </Route>
        </Route>

        {/* Hospital Portal */}
        <Route path="/hospital" element={<ProtectedRoute allowedRoles={['hospital', 'superadmin']} />}>
          <Route element={<HospitalLayout />}>
            <Route path="dashboard" element={<HospitalDashboard />} />
            {/* Add more hospital routes here */}
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App
