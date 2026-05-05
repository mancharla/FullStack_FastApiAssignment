import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Navbar from './components/Navbar';

// ✅ Just check if logged in
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ✅ All logged in users */}
        <Route path="/doctors" element={
          <PrivateRoute>
            <Navbar /><Doctors />
          </PrivateRoute>
        } />
        <Route path="/patients" element={
          <PrivateRoute>
            <Navbar /><Patients />
          </PrivateRoute>
        } />
        <Route path="/appointments" element={
          <PrivateRoute>
            <Navbar /><Appointments />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;