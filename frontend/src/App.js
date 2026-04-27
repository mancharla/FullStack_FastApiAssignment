import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/doctors" element={
          <PrivateRoute><Navbar /><Doctors /></PrivateRoute>
        } />
        <Route path="/patients" element={
          <PrivateRoute><Navbar /><Patients /></PrivateRoute>
        } />
        <Route path="/appointments" element={
          <PrivateRoute><Navbar /><Appointments /></PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;