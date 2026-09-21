import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function PortalCliente() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [envios, setEnvios] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      // Idealmente, se filtraría por cliente_id = user.id en el backend.
      const res = await api.get('/envios');
      setEnvios(res.data);
    } catch (error) {
      console.error("Error al cargar envíos", error);
    } finally {
      setCargando(false);
    }
  };

  const entregados = envios.filter(e => e.estado_actual === 'ENTREGADO').length;
  const enCamino = envios.filter(e => e.estado_actual === 'EN TRÁNSITO').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            Bienvenido, {user?.nombre || 'Cliente'} 
            <span className="badge badge-success" style={{fontSize: '12px', verticalAlign: 'middle'}}>✓ Cuenta Corporativa</span>
          </h1>
          <p className="page-subtitle">Panel de control de envíos y logística (Guatemala)</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/cliente/cotizador')}>+ Nuevo Envío / Cotizar</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '40px' }}>
         <div className="card" style={{ marginBottom: 0 }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '1px' }}>ENVÍOS EN CAMINO</span>
            <h2 style={{ margin: '5px 0', fontSize: '32px' }}>{enCamino} <small style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>paquetes</small></h2>
            <span style={{ color: 'var(--info)', fontSize: '13px', fontWeight: 'bold' }}>⚡ 24-48 hrs</span>
         </div>
         <div className="card" style={{ marginBottom: 0 }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '1px' }}>ENTREGADOS ESTE MES</span>
            <h2 style={{ margin: '5px 0', fontSize: '32px' }}>{entregados} <small style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>entregas</small></h2>
            {entregados > 0 && <span style={{ color: 'var(--success)', fontSize: '13px', fontWeight: 'bold' }}>✓ 100% efectividad</span>}
         </div>
         <div className="card" style={{ marginBottom: 0 }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '1px' }}>SALDO / LÍNEA CRÉDITO</span>
            <h2 style={{ margin: '5px 0', fontSize: '32px' }}>Q 3,500.00</h2>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Facturación quincenal</span>
         </div>
      </div>

      <div className="card">
         <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>Historial de Envíos Recientes</h3>
         <div className="table-container">
           {cargando ? (
             <p>Cargando información desde la base de datos...</p>
           ) : (
             <table>
                <thead>
                   <tr>
                     <th>GUÍA & ESTADO</th>
                     <th>PAQUETE (ID)</th>
                     <th>FECHA CREACIÓN</th>
                   </tr>
                </thead>
                <tbody>
                   {envios.map(e => (
                     <tr key={e.id}>
                       <td>
                         <strong>LX-{e.id.toString().padStart(4, '0')}-GT</strong><br/>
                         {e.estado_actual === 'ENTREGADO' && <span className="badge badge-success" style={{marginTop: '5px'}}>Entregado</span>}
                         {e.estado_actual === 'EN TRÁNSITO' && <span className="badge badge-info" style={{marginTop: '5px'}}>En Tránsito</span>}
                         {e.estado_actual === 'CREADO' && <span className="badge" style={{marginTop: '5px', background: '#f1f5f9', color: '#475569'}}>Creado</span>}
                       </td>
                       <td><strong>Paquete ID: #{e.paquete_id}</strong><br/><span style={{color: 'var(--text-secondary)'}}>Cliente ID: #{e.cliente_id}</span></td>
                       <td>{new Date(e.fecha_creacion).toLocaleDateString()}</td>
                     </tr>
                   ))}
                   {envios.length === 0 && (
                     <tr>
                       <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                         Aún no tienes envíos registrados en la base de datos.
                       </td>
                     </tr>
                   )}
                </tbody>
             </table>
           )}
         </div>
      </div>
    </div>
  );
}