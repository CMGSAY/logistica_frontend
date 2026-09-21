import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './components/Login';
import Registro from './components/Registro';
import PortalCliente from './components/PortalCliente';
import DashboardAdmin from './components/admin/DashboardAdmin';
import UsuariosAdmin from './components/admin/UsuariosAdmin';
import VehiculosAdmin from './components/admin/VehiculosAdmin';
import AlmacenesAdmin from './components/admin/AlmacenesAdmin';
import RutasAdmin from './components/admin/RutasAdmin';
import ZonasAdmin from './components/admin/ZonasAdmin';
import TarifasAdmin from './components/admin/TarifasAdmin';
import ClientesAdmin from './components/admin/ClientesAdmin';
import ConductoresAdmin from './components/admin/ConductoresAdmin';
import PaquetesAdmin from './components/admin/PaquetesAdmin';
import EnviosAdmin from './components/admin/EnviosAdmin';
import AsignacionesAdmin from './components/admin/AsignacionesAdmin';
import PortalRepartidor from './components/repartidor/PortalRepartidor';
import CotizadorCliente from './components/cliente/CotizadorCliente';
import DireccionesCliente from './components/cliente/DireccionesCliente';
import './index.css';

// Componente para proteger rutas según rol
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = React.useContext(AuthContext);

  if (!user) {
    return <Navigate to="/" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol_id)) {
    return <Navigate to="/" />; // O redirigir a una página de "No autorizado"
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          
          <Route element={<MainLayout />}>
            {/* Rutas Cliente (rol_id 2) */}
            <Route path="/cliente" element={
              <ProtectedRoute allowedRoles={[2]}>
                <PortalCliente />
              </ProtectedRoute>
            } />
            <Route path="/cliente/cotizador" element={
              <ProtectedRoute allowedRoles={[2]}>
                <CotizadorCliente />
              </ProtectedRoute>
            } />
            <Route path="/cliente/direcciones" element={
              <ProtectedRoute allowedRoles={[2]}>
                <DireccionesCliente />
              </ProtectedRoute>
            } />

            {/* Rutas Admin (rol_id 1) */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={[1]}>
                <DashboardAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/usuarios" element={
              <ProtectedRoute allowedRoles={[1]}>
                <UsuariosAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/vehiculos" element={
              <ProtectedRoute allowedRoles={[1]}>
                <VehiculosAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/almacenes" element={
              <ProtectedRoute allowedRoles={[1]}>
                <AlmacenesAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/rutas" element={
              <ProtectedRoute allowedRoles={[1]}>
                <RutasAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/asignaciones" element={
              <ProtectedRoute allowedRoles={[1]}>
                <AsignacionesAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/zonas" element={
              <ProtectedRoute allowedRoles={[1]}>
                <ZonasAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/tarifas" element={
              <ProtectedRoute allowedRoles={[1]}>
                <TarifasAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/clientes" element={
              <ProtectedRoute allowedRoles={[1]}>
                <ClientesAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/conductores" element={
              <ProtectedRoute allowedRoles={[1]}>
                <ConductoresAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/paquetes" element={
              <ProtectedRoute allowedRoles={[1]}>
                <PaquetesAdmin />
              </ProtectedRoute>
            } />
            <Route path="/admin/envios" element={
              <ProtectedRoute allowedRoles={[1]}>
                <EnviosAdmin />
              </ProtectedRoute>
            } />
            
            {/* Rutas Repartidor (rol_id 3) */}
            <Route path="/repartidor" element={
              <ProtectedRoute allowedRoles={[3]}>
                <PortalRepartidor />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}