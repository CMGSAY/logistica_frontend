import React, { useState, useEffect } from 'react';
import { Users, Truck, Package, Activity, Map } from 'lucide-react';
import api from '../../services/api';

export default function DashboardAdmin() {
  const [stats, setStats] = useState({
    usuarios: 0,
    vehiculos: 0,
    enviosActivos: 0,
    zonas: 0,
    actividad: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const resUsers = await api.get('/usuarios');
        const resVehiculos = await api.get('/vehiculos');
        const resEnvios = await api.get('/envios');
        const resZonas = await api.get('/zonas_cobertura').catch(() => ({data: []}));
        const resLogs = await api.get('/logs_sistema').catch(() => ({data: []}));

        setStats({
          usuarios: resUsers.data.length || 0,
          vehiculos: resVehiculos.data.length || 0,
          enviosActivos: resEnvios.data.filter(e => e.estado_actual !== 'ENTREGADO').length || 0,
          zonas: resZonas.data.length || 0,
          actividad: resLogs.data || []
        });
      } catch (error) {
        console.error("Error cargando estadísticas", error);
      }
    };
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard General</h1>
          <p className="page-subtitle">Resumen operativo y métricas en tiempo real</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 'bold' }}>USUARIOS REGISTRADOS</span>
            <div style={{ background: 'var(--info-bg)', color: 'var(--info-text)', padding: '8px', borderRadius: '8px' }}>
              <Users size={20} />
            </div>
          </div>
          <h2 style={{ margin: 0, fontSize: '32px' }}>{stats.usuarios}</h2>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 'bold' }}>VEHÍCULOS ACTIVOS</span>
            <div style={{ background: '#fef3c7', color: '#d97706', padding: '8px', borderRadius: '8px' }}>
              <Truck size={20} />
            </div>
          </div>
          <h2 style={{ margin: 0, fontSize: '32px' }}>{stats.vehiculos}</h2>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 'bold' }}>ENVÍOS EN TRÁNSITO</span>
            <div style={{ background: 'var(--success-bg)', color: 'var(--success-text)', padding: '8px', borderRadius: '8px' }}>
              <Package size={20} />
            </div>
          </div>
          <h2 style={{ margin: 0, fontSize: '32px' }}>{stats.enviosActivos}</h2>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 'bold' }}>ZONAS DE COBERTURA</span>
            <div style={{ background: '#f3e8ff', color: '#7e22ce', padding: '8px', borderRadius: '8px' }}>
              <Map size={20} />
            </div>
          </div>
          <h2 style={{ margin: 0, fontSize: '32px' }}>{stats.zonas}</h2>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0, borderBottom: '1px solid var(--border-color)', paddingBottom: '15px', color: 'var(--text-primary)' }}>Actividad Reciente</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Aquí se mostrará el log de actividades (auditoria_acciones) de los usuarios del sistema.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          {stats.actividad && stats.actividad.length > 0 ? (
            stats.actividad.slice(0, 5).map((log, i) => (
              <div key={log.id || i} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ background: 'var(--bg-primary)', padding: '10px', borderRadius: '50%' }}>
                  <Activity size={16} color="var(--accent-primary)" />
                </div>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold' }}>{log.mensaje || log.accion || 'Actividad registrada'}</p>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{log.fecha_log || log.fecha_accion ? new Date(log.fecha_log || log.fecha_accion).toLocaleString() : 'Reciente'}</span>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Esperando actividad reciente...</p>
          )}
        </div>
      </div>
    </div>
  );
}
