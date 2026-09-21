import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Search, MapPin } from 'lucide-react';
import Modal from '../common/Modal';

export default function ZonasAdmin() {
  const [zonas, setZonas] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    codigo_postal_inicio: '',
    codigo_postal_fin: ''
  });

  useEffect(() => {
    cargarZonas();
  }, []);

  const cargarZonas = async () => {
    try {
      const res = await api.get('/zonas_cobertura');
      setZonas(res.data);
    } catch (error) {
      console.error("Error al cargar zonas", error);
    } finally {
      setCargando(false);
    }
  };

  const handleOpenModal = (zona = null) => {
    if (zona) {
      setEditandoId(zona.id);
      setFormData({
        nombre: zona.nombre,
        codigo_postal_inicio: zona.codigo_postal_inicio,
        codigo_postal_fin: zona.codigo_postal_fin
      });
    } else {
      setEditandoId(null);
      setFormData({ nombre: '', codigo_postal_inicio: '', codigo_postal_fin: '' });
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
        await api.put(`/zonas_cobertura/${editandoId}`, formData);
      } else {
        await api.post('/zonas_cobertura', formData);
      }
      handleCloseModal();
      cargarZonas();
    } catch (error) {
      console.error("Error al guardar zona", error);
      alert("Ocurrió un error al guardar.");
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta zona de cobertura?')) {
      try {
        await api.delete(`/zonas_cobertura/${id}`);
        cargarZonas();
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
          <h1 className="page-title">Zonas de Cobertura</h1>
          <p className="page-subtitle">Administra las áreas geográficas donde opera la logística</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Nueva Zona
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
            <input 
              type="text" 
              placeholder="Buscar zona..." 
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
                  <th>Nombre de Zona</th>
                  <th>C.P. Inicio</th>
                  <th>C.P. Fin</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {zonas.map(z => (
                  <tr key={z.id}>
                    <td><span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>#{z.id}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: '#f3e8ff', color: '#7e22ce', padding: '6px', borderRadius: '6px' }}><MapPin size={14} /></div>
                        <span style={{ fontWeight: '600' }}>{z.nombre}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-info">{z.codigo_postal_inicio}</span></td>
                    <td><span className="badge badge-info">{z.codigo_postal_fin}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleOpenModal(z)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><Edit2 size={18} /></button>
                        <button onClick={() => handleEliminar(z.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {zonas.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Esperando zonas...</td>
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
        title={editandoId ? "Editar Zona de Cobertura" : "Nueva Zona de Cobertura"}
      >
        <form onSubmit={handleGuardar}>
          <div className="form-group">
            <label className="form-label">Nombre de la Zona</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
              required 
            />
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">C.P. Inicio</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.codigo_postal_inicio}
                onChange={e => setFormData({...formData, codigo_postal_inicio: e.target.value})}
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">C.P. Fin</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.codigo_postal_fin}
                onChange={e => setFormData({...formData, codigo_postal_fin: e.target.value})}
                required 
              />
            </div>
          </div>
          <div className="modal-footer" style={{ marginTop: '20px', padding: '15px 0 0 0', background: 'transparent' }}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Zona</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
