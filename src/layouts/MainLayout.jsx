import React, { useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Box, LogOut, LayoutDashboard, Users, Truck, Map, Navigation, AlertTriangle, Wallet, Building2, Route, Briefcase, UserCheck, Package } from 'lucide-react';
import '../index.css';

export default function MainLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };


  let menu = [];
  let roleLabel = '';

  if (!user) {
    return <div>Cargando...</div>;
  }

  if (user.rol_id === 1) { // Admin
    roleLabel = 'Administrador';
    menu = [
      { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      { path: '/admin/usuarios', label: 'Usuarios', icon: <Users size={18} /> },
      { path: '/admin/clientes', label: 'Clientes', icon: <Briefcase size={18} /> },
      { path: '/admin/conductores', label: 'Conductores', icon: <UserCheck size={18} /> },
      { path: '/admin/vehiculos', label: 'Vehículos', icon: <Truck size={18} /> },
      { path: '/admin/almacenes', label: 'Almacenes', icon: <Building2 size={18} /> },
      { path: '/admin/rutas', label: 'Rutas', icon: <Route size={18} /> },
      { path: '/admin/asignaciones', label: 'Asignaciones / Despacho', icon: <Navigation size={18} /> },
      { path: '/admin/zonas', label: 'Zonas de Cobertura', icon: <Map size={18} /> },
      { path: '/admin/tarifas', label: 'Tarifas', icon: <Wallet size={18} /> },
      { path: '/admin/paquetes', label: 'Paquetes', icon: <Package size={18} /> },
      { path: '/admin/envios', label: 'Envíos', icon: <Box size={18} /> },
    ];
  } else if (user.rol_id === 2) { // Cliente
    roleLabel = 'Cliente Corporativo';
    menu = [
      { path: '/cliente', label: 'Mis Envíos', icon: <Package size={18} /> },
      { path: '/cliente/cotizador', label: 'Nuevo Envío & Cotizador', icon: <Box size={18} /> },
      { path: '/cliente/direcciones', label: 'Direcciones Guardadas', icon: <Map size={18} /> },
    ];
  } else if (user.rol_id === 3) { // Repartidor
    roleLabel = 'Repartidor / Conductor';
    menu = [
      { path: '/repartidor', label: 'Mi Ruta Activa', icon: <Navigation size={18} /> },
      { path: '/repartidor/incidencias', label: 'Reportar Incidencia', icon: <AlertTriangle size={18} /> },
    ];
  }

  return (
    <div className="layout">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2><Box size={24} style={{ marginRight: '8px' }} /> LogixTrack</h2>
          <span className="role-badge">{roleLabel}</span>
        </div>

        <div className="user-info">
          <p className="user-name">{user.nombre}</p>
          <p className="user-email">{user.email}</p>
        </div>

        <ul className="menu">
          {menu.map((item) => (
            <li 
              key={item.path} 
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="menu-icon">{item.icon}</span>
              {item.label}
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}
