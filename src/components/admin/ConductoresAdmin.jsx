import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Search, UserCheck } from 'lucide-react';
import Modal from '../common/Modal';

export default function ConductoresAdmin() {
  const [conductores, setConductores] = useState([]);
  const [usuarios, setUsuarios] = useState({});
  const [usuariosLista, setUsuariosLista] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    usuario_id: '',
    licencia: '',
    estado: 'DISPONIBLE'
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resCond, resUsr] = await Promise.all([
        api.get('/conductores'),
        api.get('/usuarios')
      ]);
      
      const usrMap = {};
      resUsr.data.forEach(u => {
        usrMap[u.id] = { nombre: u.nombre, email: u.email };
      });
      
      setUsuarios(usrMap);
      setUsuariosLista(resUsr.data.filter(u => u.rol_id === 3)); // Usuarios con rol Repartidor (3)
      setConductores(resCond.data);
    } catch (error) {
      console.error("Error al cargar conductores", error);
    } finally {
      setCargando(false);
    }
  };

  const handleOpenModal = (conductor = null) => {
    if (conductor) {
      setEditandoId(conductor.id);
      setFormData({
        usuario_id: conductor.usuario_id,
        licencia: conductor.licencia || '',
        estado: conductor.estado || 'DISPONIBLE'
      });
    } else {
      setEditandoId(null);
      setFormData({ usuario_id: '', licencia: '', estado: 'DISPONIBLE' });
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
        await api.put(`/conductores/${editandoId}`, formData);
      } else {
        await api.post('/conductores', formData);
      }
      handleCloseModal();
      cargarDatos();
    } catch (error) {
      console.error("Error al guardar conductor", error);
      alert("Ocurrió un error al guardar. Verifica la conexión.");
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este conductor?')) {
      try {
        await api.delete(`/conductores/${id}`);
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
          <h1 className="page-title">Directorio de Conductores</h1>
          <p className="page-subtitle">Gestión de licencias y disponibilidad del personal operativo</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Nuevo Conductor
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
            <input 
              type="text" 
              placeholder="Buscar por licencia o nombre..." 
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
                  <th>Nombre (Usuario)</th>
                  <th>Licencia</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {conductores.map(c => (
                  <tr key={c.id}>
                    <td><span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>#{c.id}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: '#fce7f3', color: '#be185d', padding: '6px', borderRadius: '6px' }}><UserCheck size={14} /></div>
                        <div>
                          <p style={{ margin: 0, fontWeight: '600' }}>{usuarios[c.usuario_id]?.nombre || `Usuario ID: ${c.usuario_id}`}</p>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{usuarios[c.usuario_id]?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{c.licencia}</td>
                    <td>
                      {c.estado === 'DISPONIBLE' ? (
                         <span className="badge badge-success">Disponible</span>
                      ) : (
                         <span className="badge badge-info">En Ruta</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleOpenModal(c)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><Edit2 size={18} /></button>
                        <button onClick={() => handleEliminar(c.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {conductores.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Esperando conductores...</td>
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
        title={editandoId ? "Editar Conductor" : "Nuevo Conductor"}
      >
        <form onSubmit={handleGuardar}>
          <div className="form-group">
            <label className="form-label">Cuenta de Usuario (Rol Repartidor)</label>
            <select 
              className="form-input"
              value={formData.usuario_id}
              onChange={e => setFormData({...formData, usuario_id: e.target.value})}
              required
            >
              <option value="">Selecciona un usuario...</option>
              {usuariosLista.map(u => (
                <option key={u.id} value={u.id}>{u.nombre}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Número de Licencia</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.licencia}
              onChange={e => setFormData({...formData, licencia: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Estado Inicial</label>
            <select 
              className="form-input"
              value={formData.estado}
              onChange={e => setFormData({...formData, estado: e.target.value})}
            >
              <option value="DISPONIBLE">Disponible</option>
              <option value="EN RUTA">En Ruta</option>
            </select>
          </div>
          <div className="modal-footer" style={{ marginTop: '20px', padding: '15px 0 0 0', background: 'transparent' }}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Conductor</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
