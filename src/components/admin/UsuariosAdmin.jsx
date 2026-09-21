import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import Modal from '../common/Modal';

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol_id: 2
  });

  useEffect(() => {
    cargarUsuarios();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarUsuarios = async () => {
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
    } catch (error) {
      console.error("Error al cargar usuarios", error);
    } finally {
      setCargando(false);
    }
  };

  const handleOpenModal = (usuario = null) => {
    if (usuario) {
      setEditandoId(usuario.id);
      setFormData({
        nombre: usuario.nombre,
        email: usuario.email,
        password: '',
        rol_id: usuario.rol_id
      });
    } else {
      setEditandoId(null);
      setFormData({ nombre: '', email: '', password: '', rol_id: 2 });
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
        
        const payload = { ...formData };
        if (!payload.password) delete payload.password;
        await api.put(`/usuarios/${editandoId}`, payload);
      } else {
        await api.post('/usuarios', formData);
      }
      handleCloseModal();
      cargarUsuarios();
    } catch (error) {
      console.error("Error al guardar usuario", error);
      alert("Ocurrió un error al guardar el usuario.");
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        await api.delete(`/usuarios/${id}`);
        cargarUsuarios();
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
          <h1 className="page-title">Gestión de Usuarios</h1>
          <p className="page-subtitle">Administra los accesos al sistema y los roles</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Nuevo Usuario
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o correo..." 
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
                  <th>Nombre</th>
                  <th>Correo Electrónico</th>
                  <th>Rol</th>
                  <th>Fecha de Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(user => (
                  <tr key={user.id}>
                    <td><span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>#{user.id}</span></td>
                    <td style={{ fontWeight: '600' }}>{user.nombre}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.rol_id === 1 && <span className="badge badge-info">Admin</span>}
                      {user.rol_id === 2 && <span className="badge badge-success">Cliente</span>}
                      {user.rol_id === 3 && <span className="badge" style={{background: '#fef3c7', color: '#d97706'}}>Repartidor</span>}
                    </td>
                    <td>{new Date(user.fecha_creacion).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleOpenModal(user)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><Edit2 size={18} /></button>
                        <button onClick={() => handleEliminar(user.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {usuarios.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Esperando usuarios...</td>
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
        title={editandoId ? "Editar Usuario" : "Nuevo Usuario"}
      >
        <form onSubmit={handleGuardar}>
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.nombre}
              onChange={e => setFormData({...formData, nombre: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input 
              type="email" 
              className="form-input" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contraseña {editandoId && <small>(Dejar en blanco para no cambiar)</small>}</label>
            <input 
              type="password" 
              className="form-input" 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              required={!editandoId} 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Rol del Sistema</label>
            <select 
              className="form-input"
              value={formData.rol_id}
              onChange={e => setFormData({...formData, rol_id: parseInt(e.target.value)})}
            >
              <option value={1}>Administrador</option>
              <option value={2}>Cliente</option>
              <option value={3}>Repartidor</option>
            </select>
          </div>
          <div className="modal-footer" style={{ marginTop: '20px', padding: '15px 0 0 0', background: 'transparent' }}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Usuario</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
