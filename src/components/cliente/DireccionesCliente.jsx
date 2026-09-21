import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Search, MapPin } from 'lucide-react';

export default function DireccionesCliente() {
  const [direcciones, setDirecciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDirecciones();
  }, []);

  const cargarDirecciones = async () => {
    try {
      const res = await api.get('/direcciones');
      setDirecciones(res.data);
    } catch (error) {
      console.error("Error al cargar direcciones", error);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis Direcciones Guardadas</h1>
          <p className="page-subtitle">Gestiona tus puntos de origen y destino frecuentes (Guatemala)</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} /> Nueva Dirección
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
            <input 
              type="text" 
              placeholder="Buscar dirección..." 
              className="form-input" 
              style={{ paddingLeft: '40px' }} 
            />
          </div>
        </div>

        <div className="table-container">
          {cargando ? (
            <p>Cargando datos de la base de datos...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Calle y Número</th>
                  <th>Colonia / Zona</th>
                  <th>Ciudad</th>
                  <th>Estado / Depto.</th>
                  <th>Código Postal</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {direcciones.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={16} color="var(--accent-primary)" />
                        <span style={{ fontWeight: '600' }}>{d.calle} {d.numero_exterior}</span>
                      </div>
                    </td>
                    <td>{d.colonia || 'S/N'}</td>
                    <td>{d.ciudad}</td>
                    <td>{d.estado}</td>
                    <td><span className="badge badge-info">{d.codigo_postal}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><Edit2 size={18} /></button>
                        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {direcciones.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Aún no tienes direcciones guardadas. Haz clic en "Nueva Dirección" para agregar una.</td>
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
