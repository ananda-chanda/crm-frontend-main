import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Customers from './pages/Customers';
import Deals from './pages/Deals';
import Activities from './pages/Activities';
import SystemLogs from './pages/SystemLogs';

import Users from './pages/Users';
import Roles from './pages/Roles';

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route path="" element={<PrivateRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="customers" element={<Customers />} />
            <Route path="deals" element={<Deals />} />
            <Route path="activities" element={<Activities />} />
            <Route path="system-logs" element={<SystemLogs />} />
            <Route path="users" element={<Users />} />
            <Route path="roles" element={<Roles />} />
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
