import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Search, Map } from 'lucide-react';
import Modal from '../common/Modal';

export default function AsignacionesAdmin() {
  const [asignaciones, setAsignaciones] = useState([]);
  
  // Catálogos para los selects y para mostrar nombres
  const [conductores, setConductores] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [usuarios, setUsuarios] = useState({});
  const [almacenes, setAlmacenes] = useState({});

  const [cargando, setCargando] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    conductor_id: '',
    vehiculo_id: '',
    ruta_id: '',
    fecha_salida_programada: '',
    fecha_llegada_estimada: '',
    estado: 'PROGRAMADA'
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resAsig, resCond, resVeh, resRut, resUsr, resAlm] = await Promise.all([
        api.get('/asignaciones'),
        api.get('/conductores'),
        api.get('/vehiculos'),
        api.get('/rutas'),
        api.get('/usuarios'),
        api.get('/almacenes')
      ]);
      
      // Mapear usuarios para el nombre del conductor
      const usrMap = {};
      resUsr.data.forEach(u => { usrMap[u.id] = u.nombre; });
      setUsuarios(usrMap);

      // Mapear almacenes para la ruta
      const almMap = {};
      resAlm.data.forEach(a => { almMap[a.id] = a.nombre; });
      setAlmacenes(almMap);

      setConductores(resCond.data);
      setVehiculos(resVeh.data);
      setRutas(resRut.data);
      setAsignaciones(resAsig.data);
    } catch (error) {
      console.error("Error al cargar asignaciones", error);
    } finally {
      setCargando(false);
    }
  };

  const handleOpenModal = (asignacion = null) => {
    if (asignacion) {
      setEditandoId(asignacion.id);
      setFormData({
        conductor_id: asignacion.conductor_id,
        vehiculo_id: asignacion.vehiculo_id,
        ruta_id: asignacion.ruta_id,
        fecha_salida_programada: asignacion.fecha_salida_programada ? asignacion.fecha_salida_programada.slice(0, 16) : '',
        fecha_llegada_estimada: asignacion.fecha_llegada_estimada ? asignacion.fecha_llegada_estimada.slice(0, 16) : '',
        estado: asignacion.estado || 'PROGRAMADA'
      });
    } else {
      setEditandoId(null);
      setFormData({
        conductor_id: '',
        vehiculo_id: '',
        ruta_id: '',
        fecha_salida_programada: '',
        fecha_llegada_estimada: '',
        estado: 'PROGRAMADA'
      });
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
        await api.put(`/asignaciones/${editandoId}`, formData);
      } else {
        await api.post('/asignaciones', formData);
      }
      handleCloseModal();
      cargarDatos();
    } catch (error) {
      console.error("Error al guardar asignación", error);
      alert("Ocurrió un error al guardar. Verifica que todos los campos sean correctos.");
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar/eliminar esta asignación?')) {
      try {
        await api.delete(`/asignaciones/${id}`);
        cargarDatos();
      } catch (error) {
        console.error("Error al eliminar", error);
        alert("Ocurrió un error al eliminar.");
      }
    }
  };

  const getNombreConductor = (conductorId) => {
    const c = conductores.find(x => x.id === conductorId);
    return c ? usuarios[c.usuario_id] : `ID ${conductorId}`;
  };

  const getVehiculoStr = (vehiculoId) => {
    const v = vehiculos.find(x => x.id === vehiculoId);
    return v ? `${v.marca} ${v.modelo} (${v.placa})` : `ID ${vehiculoId}`;
  };

  const getRutaStr = (rutaId) => {
    const r = rutas.find(x => x.id === rutaId);
    if (!r) return `Ruta #${rutaId}`;
    return `${almacenes[r.almacen_origen_id]} ➔ ${almacenes[r.almacen_destino_id]}`;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Asignaciones de Ruta</h1>
          <p className="page-subtitle">Despacho de vehículos y conductores para cada troncal</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Nueva Asignación
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
            <input 
              type="text" 
              placeholder="Buscar por ID..." 
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
                  <th>Ruta (Origen ➔ Destino)</th>
                  <th>Conductor y Vehículo</th>
                  <th>Tiempos</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {asignaciones.map(a => (
                  <tr key={a.id}>
                    <td><span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>#{a.id}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Map size={16} color="var(--accent-primary)" />
                        <span style={{ fontWeight: '600' }}>{getRutaStr(a.ruta_id)}</span>
                      </div>
                    </td>
                    <td>
                      <strong>{getNombreConductor(a.conductor_id)}</strong><br/>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{getVehiculoStr(a.vehiculo_id)}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px' }}><strong>Salida:</strong> {new Date(a.fecha_salida_programada).toLocaleString()}</span><br/>
                      <span style={{ fontSize: '12px' }}><strong>Llegada:</strong> {new Date(a.fecha_llegada_estimada).toLocaleString()}</span>
                    </td>
                    <td>
                      {a.estado === 'PROGRAMADA' && <span className="badge" style={{background: '#f1f5f9', color: '#475569'}}>Programada</span>}
                      {a.estado === 'EN CURSO' && <span className="badge badge-info">En Curso</span>}
                      {a.estado === 'COMPLETADA' && <span className="badge badge-success">Completada</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleOpenModal(a)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><Edit2 size={18} /></button>
                        <button onClick={() => handleEliminar(a.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {asignaciones.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Esperando asignaciones...</td>
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
        title={editandoId ? "Editar Asignación" : "Nueva Asignación de Despacho"}
      >
        <form onSubmit={handleGuardar}>
          <div className="form-group">
            <label className="form-label">Conductor</label>
            <select 
              className="form-input"
              value={formData.conductor_id}
              onChange={e => setFormData({...formData, conductor_id: e.target.value})}
              required
            >
              <option value="">Selecciona un conductor...</option>
              {conductores.map(c => (
                <option key={c.id} value={c.id}>{usuarios[c.usuario_id]} (Lic: {c.licencia})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Vehículo</label>
            <select 
              className="form-input"
              value={formData.vehiculo_id}
              onChange={e => setFormData({...formData, vehiculo_id: e.target.value})}
              required
            >
              <option value="">Selecciona un vehículo...</option>
              {vehiculos.map(v => (
                <option key={v.id} value={v.id}>{v.marca} {v.modelo} - Placa: {v.placa}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Ruta Troncal</label>
            <select 
              className="form-input"
              value={formData.ruta_id}
              onChange={e => setFormData({...formData, ruta_id: e.target.value})}
              required
            >
              <option value="">Selecciona una ruta...</option>
              {rutas.map(r => (
                <option key={r.id} value={r.id}>{almacenes[r.almacen_origen_id]} ➔ {almacenes[r.almacen_destino_id]}</option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Fecha/Hora Salida</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                value={formData.fecha_salida_programada}
                onChange={e => setFormData({...formData, fecha_salida_programada: e.target.value})}
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Fecha/Hora Llegada Est.</label>
              <input 
                type="datetime-local" 
                className="form-input" 
                value={formData.fecha_llegada_estimada}
                onChange={e => setFormData({...formData, fecha_llegada_estimada: e.target.value})}
                required 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Estado de la Asignación</label>
            <select 
              className="form-input"
              value={formData.estado}
              onChange={e => setFormData({...formData, estado: e.target.value})}
            >
              <option value="PROGRAMADA">Programada (No ha salido)</option>
              <option value="EN CURSO">En Curso</option>
              <option value="COMPLETADA">Completada</option>
            </select>
          </div>

          <div className="modal-footer" style={{ marginTop: '20px', padding: '15px 0 0 0', background: 'transparent' }}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Asignación</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
