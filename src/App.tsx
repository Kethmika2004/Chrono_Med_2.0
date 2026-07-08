import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import AuthLayout from '@/components/layout/AuthLayout'
import Login from '@/pages/auth/Login'
import Register from '@/pages/auth/Register'
import PatientLayout from '@/components/layout/PatientLayout'
import PatientDashboard from '@/pages/patient/Dashboard'
import BookAppointment from '@/pages/patient/BookAppointment'
import QueueTracker from '@/pages/patient/QueueTracker'
import Appointments from '@/pages/patient/Appointments'
import Documents from '@/pages/patient/Documents'
import HealthRecord from '@/pages/patient/HealthRecord'
import Notifications from '@/pages/patient/Notifications'
import PatientSettings from '@/pages/patient/Settings'
import DoctorLayout from '@/components/layout/DoctorLayout'
import DoctorDashboard from '@/pages/doctor/Dashboard'
import DoctorSessions from '@/pages/doctor/Sessions'
import SessionManage from '@/pages/doctor/SessionManage'
import Prescriptions from '@/pages/doctor/Prescriptions'
import DoctorAnalytics from '@/pages/doctor/Analytics'
import HospitalLayout from '@/components/layout/HospitalLayout'
import HospitalDashboard from '@/pages/hospital/Dashboard'
import HospitalDoctors from '@/pages/hospital/Doctors'
import HospitalSessions from '@/pages/hospital/Sessions'
import HospitalAppointments from '@/pages/hospital/Appointments'
import HospitalAnalytics from '@/pages/hospital/Analytics'
import AuditLog from '@/pages/hospital/AuditLog'
import HospitalSettings from '@/pages/hospital/Settings'
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
            <Route path="book" element={<BookAppointment />} />
            <Route path="queue" element={<QueueTracker />} />
            <Route path="queue/:appointmentId" element={<QueueTracker />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="documents" element={<Documents />} />
            <Route path="health-record" element={<HealthRecord />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<PatientSettings />} />
          </Route>
        </Route>

        {/* Doctor Portal */}
        <Route path="/doctor" element={<ProtectedRoute allowedRoles={['doctor']} />}>
          <Route element={<DoctorLayout />}>
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="sessions" element={<DoctorSessions />} />
            <Route path="session/:sessionId/manage" element={<SessionManage />} />
            <Route path="session-manage" element={<SessionManage />} />
            <Route path="prescriptions" element={<Prescriptions />} />
            <Route path="analytics" element={<DoctorAnalytics />} />
          </Route>
        </Route>

        {/* Hospital Portal */}
        <Route path="/hospital" element={<ProtectedRoute allowedRoles={['hospital', 'superadmin']} />}>
          <Route element={<HospitalLayout />}>
            <Route path="dashboard" element={<HospitalDashboard />} />
            <Route path="doctors" element={<HospitalDoctors />} />
            <Route path="sessions" element={<HospitalSessions />} />
            <Route path="appointments" element={<HospitalAppointments />} />
            <Route path="analytics" element={<HospitalAnalytics />} />
            <Route path="audit-log" element={<AuditLog />} />
            <Route path="settings" element={<HospitalSettings />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  )
}

export default App