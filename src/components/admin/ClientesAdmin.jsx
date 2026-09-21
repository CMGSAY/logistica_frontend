import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Search, Briefcase } from 'lucide-react';
import Modal from '../common/Modal';

export default function ClientesAdmin() {
  const [clientes, setClientes] = useState([]);
  const [usuarios, setUsuarios] = useState({});
  const [usuariosLista, setUsuariosLista] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    usuario_id: '',
    rfc: '',
    telefono: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resCli, resUsr] = await Promise.all([
        api.get('/clientes'),
        api.get('/usuarios')
      ]);
      
      const usrMap = {};
      resUsr.data.forEach(u => {
        usrMap[u.id] = { nombre: u.nombre, email: u.email };
      });
      
      setUsuarios(usrMap);
      setUsuariosLista(resUsr.data.filter(u => u.rol_id === 2)); // Solo mostrar usuarios con rol de Cliente (2)
      setClientes(resCli.data);
    } catch (error) {
      console.error("Error al cargar clientes", error);
    } finally {
      setCargando(false);
    }
  };

  const handleOpenModal = (cliente = null) => {
    if (cliente) {
      setEditandoId(cliente.id);
      setFormData({
        usuario_id: cliente.usuario_id,
        rfc: cliente.rfc || '',
        telefono: cliente.telefono || ''
      });
    } else {
      setEditandoId(null);
      setFormData({ usuario_id: '', rfc: '', telefono: '' });
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
        await api.put(`/clientes/${editandoId}`, formData);
      } else {
        await api.post('/clientes', formData);
      }
      handleCloseModal();
      cargarDatos();
    } catch (error) {
      console.error("Error al guardar cliente", error);
      alert("Ocurrió un error al guardar. Asegúrate de que el usuario no tenga ya un cliente asignado.");
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar la información de cliente de este usuario?')) {
      try {
        await api.delete(`/clientes/${id}`);
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
          <h1 className="page-title">Directorio de Clientes</h1>
          <p className="page-subtitle">Gestión de cuentas corporativas y datos fiscales</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Nuevo Cliente
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
            <input 
              type="text" 
              placeholder="Buscar por RFC o nombre..." 
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
                  <th>Empresa / Razón Social</th>
                  <th>RFC</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map(c => (
                  <tr key={c.id}>
                    <td><span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>#{c.id}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: '#dbeafe', color: '#1e40af', padding: '6px', borderRadius: '6px' }}><Briefcase size={14} /></div>
                        <div>
                          <p style={{ margin: 0, fontWeight: '600' }}>{usuarios[c.usuario_id]?.nombre || `Usuario ID: ${c.usuario_id}`}</p>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{usuarios[c.usuario_id]?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-info">{c.rfc}</span></td>
                    <td>{c.telefono}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleOpenModal(c)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><Edit2 size={18} /></button>
                        <button onClick={() => handleEliminar(c.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {clientes.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Esperando clientes...</td>
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
        title={editandoId ? "Editar Cliente Corporativo" : "Nuevo Cliente Corporativo"}
      >
        <form onSubmit={handleGuardar}>
          <div className="form-group">
            <label className="form-label">Cuenta de Usuario (Debe tener Rol Cliente)</label>
            <select 
              className="form-input"
              value={formData.usuario_id}
              onChange={e => setFormData({...formData, usuario_id: e.target.value})}
              required
            >
              <option value="">Selecciona un usuario...</option>
              {usuariosLista.map(u => (
                <option key={u.id} value={u.id}>{u.nombre} ({u.email})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">RFC (Registro Federal de Contribuyentes)</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.rfc}
              onChange={e => setFormData({...formData, rfc: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono de Contacto</label>
            <input 
              type="tel" 
              className="form-input" 
              value={formData.telefono}
              onChange={e => setFormData({...formData, telefono: e.target.value})}
            />
          </div>
          <div className="modal-footer" style={{ marginTop: '20px', padding: '15px 0 0 0', background: 'transparent' }}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Datos Fiscales</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
