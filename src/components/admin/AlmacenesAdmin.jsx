import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Search, Building2 } from 'lucide-react';
import Modal from '../common/Modal';

export default function AlmacenesAdmin() {
  const [almacenes, setAlmacenes] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    capacidad_paquetes: ''
  });

  useEffect(() => {
    cargarAlmacenes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarAlmacenes = async () => {
    try {
      const res = await api.get('/almacenes');
      setAlmacenes(res.data);
    } catch (error) {
      console.error("Error al cargar almacenes", error);
    } finally {
      setCargando(false);
    }
  };

  const handleOpenModal = (almacen = null) => {
    if (almacen) {
      setEditandoId(almacen.id);
      setFormData({
        nombre: almacen.nombre,
        direccion: almacen.direccion,
        capacidad_paquetes: almacen.capacidad_paquetes
      });
    } else {
      setEditandoId(null);
      setFormData({ nombre: '', direccion: '', capacidad_paquetes: '' });
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
        await api.put(`/almacenes/${editandoId}`, formData);
      } else {
        await api.post('/almacenes', formData);
      }
      handleCloseModal();
      cargarAlmacenes();
    } catch (error) {
      console.error("Error al guardar almacén", error);
      alert("Ocurrió un error al guardar.");
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este almacén?')) {
      try {
        await api.delete(`/almacenes/${id}`);
        cargarAlmacenes();
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
          <h1 className="page-title">Gestión de Almacenes</h1>
          <p className="page-subtitle">Bodegas y centros de distribución logísticos</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Nuevo Almacén
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o dirección..." 
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
                  <th>Nombre del Almacén</th>
                  <th>Dirección</th>
                  <th>Capacidad (Paquetes)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {almacenes.map(a => (
                  <tr key={a.id}>
                    <td><span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>#{a.id}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '6px', borderRadius: '6px' }}><Building2 size={14} /></div>
                        <span style={{ fontWeight: '600' }}>{a.nombre}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{a.direccion}</td>
                    <td>
                      <span className="badge badge-info">{a.capacidad_paquetes} max</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleOpenModal(a)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><Edit2 size={18} /></button>
                        <button onClick={() => handleEliminar(a.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {almacenes.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Esperando almacenes...</td>
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
        title={editandoId ? "Editar Almacén" : "Nuevo Almacén"}
      >
        <form onSubmit={handleGuardar}>
          <div className="form-group">
            <label className="form-label">Nombre del Almacén</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Dirección Completa</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.direccion}
              onChange={e => setFormData({...formData, direccion: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Capacidad de Paquetes</label>
            <input 
              type="number" 
              className="form-input" 
              value={formData.capacidad_paquetes}
              onChange={e => setFormData({...formData, capacidad_paquetes: e.target.value})}
              required 
            />
          </div>
          <div className="modal-footer" style={{ marginTop: '20px', padding: '15px 0 0 0', background: 'transparent' }}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Almacén</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
