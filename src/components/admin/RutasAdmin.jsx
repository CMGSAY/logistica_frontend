import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Search, Route } from 'lucide-react';
import Modal from '../common/Modal';

export default function RutasAdmin() {
  const [rutas, setRutas] = useState([]);
  const [almacenes, setAlmacenes] = useState({});
  const [almacenesLista, setAlmacenesLista] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    almacen_origen_id: '',
    almacen_destino_id: '',
    distancia_km: '',
    tiempo_estimado_horas: ''
  });

  useEffect(() => {
    cargarDatos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarDatos = async () => {
    try {
      const [resRutas, resAlmacenes] = await Promise.all([
        api.get('/rutas'),
        api.get('/almacenes')
      ]);
      
      const almacenesMap = {};
      resAlmacenes.data.forEach(a => {
        almacenesMap[a.id] = a.nombre;
      });
      
      setAlmacenes(almacenesMap);
      setAlmacenesLista(resAlmacenes.data);
      setRutas(resRutas.data);
    } catch (error) {
      console.error("Error al cargar rutas", error);
    } finally {
      setCargando(false);
    }
  };

  const handleOpenModal = (ruta = null) => {
    if (ruta) {
      setEditandoId(ruta.id);
      setFormData({
        almacen_origen_id: ruta.almacen_origen_id,
        almacen_destino_id: ruta.almacen_destino_id,
        distancia_km: ruta.distancia_km,
        tiempo_estimado_horas: ruta.tiempo_estimado_horas
      });
    } else {
      setEditandoId(null);
      setFormData({ almacen_origen_id: '', almacen_destino_id: '', distancia_km: '', tiempo_estimado_horas: '' });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditandoId(null);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        await api.put(`/rutas/${editandoId}`, formData);
      } else {
        await api.post('/rutas', formData);
      }
      handleCloseModal();
      cargarDatos();
    } catch (error) {
      console.error("Error al guardar ruta", error);
      alert("Ocurrió un error al guardar. Asegúrese de que el origen y destino no sean el mismo.");
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta ruta troncal?')) {
      try {
        await api.delete(`/rutas/${id}`);
        cargarDatos();
      } catch (error) {
        console.error("Error al eliminar", error);
        alert("Ocurrió un error al eliminar.");
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Rutas Troncales</h1>
          <p className="page-subtitle">Rutas de distribución entre almacenes</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Nueva Ruta
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
            <input 
              type="text" 
              placeholder="Buscar ruta..." 
              className="form-input" 
              style={{ paddingLeft: '40px' }} 
            />
          </div>
        </div>

        <div className="table-container">
          {cargando ? (
            <p>Cargando datos...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Trayecto</th>
                  <th>Distancia (km)</th>
                  <th>Tiempo Est. (hrs)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rutas.map(r => (
                  <tr key={r.id}>
                    <td><span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>#{r.id}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Route size={14} color="var(--accent-primary)" />
                        <span style={{ fontWeight: '600' }}>
                          {almacenes[r.almacen_origen_id] || `Bodega ${r.almacen_origen_id}`} ➔ {almacenes[r.almacen_destino_id] || `Bodega ${r.almacen_destino_id}`}
                        </span>
                      </div>
                    </td>
                    <td>{r.distancia_km} km</td>
                    <td>{r.tiempo_estimado_horas} hrs</td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleOpenModal(r)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><Edit2 size={18} /></button>
                        <button onClick={() => handleEliminar(r.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rutas.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Esperando rutas...</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={handleCloseModal} 
        title={editandoId ? "Editar Ruta Troncal" : "Nueva Ruta Troncal"}
      >
        <form onSubmit={handleGuardar}>
          <div className="form-group">
            <label className="form-label">Almacén de Origen</label>
            <select 
              className="form-input"
              value={formData.almacen_origen_id}
              onChange={e => setFormData({...formData, almacen_origen_id: e.target.value})}
              required
            >
              <option value="">Selecciona origen...</option>
              {almacenesLista.map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Almacén de Destino</label>
            <select 
              className="form-input"
              value={formData.almacen_destino_id}
              onChange={e => setFormData({...formData, almacen_destino_id: e.target.value})}
              required
            >
              <option value="">Selecciona destino...</option>
              {almacenesLista.map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Distancia (km)</label>
              <input 
                type="number"
                step="0.01" 
                className="form-input" 
                value={formData.distancia_km}
                onChange={e => setFormData({...formData, distancia_km: e.target.value})}
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Tiempo Estimado (horas)</label>
              <input 
                type="number" 
                step="0.01"
                className="form-input" 
                value={formData.tiempo_estimado_horas}
                onChange={e => setFormData({...formData, tiempo_estimado_horas: e.target.value})}
                required 
              />
            </div>
          </div>
          <div className="modal-footer" style={{ marginTop: '20px', padding: '15px 0 0 0', background: 'transparent' }}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Ruta</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
