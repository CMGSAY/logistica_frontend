import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Search, Package } from 'lucide-react';
import Modal from '../common/Modal';

export default function EnviosAdmin() {
  const [envios, setEnvios] = useState([]);
  const [clientes, setClientes] = useState({});
  const [clientesLista, setClientesLista] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    cliente_id: '',
    estado_actual: 'CREADO'
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resEnv, resCli, resUsr] = await Promise.all([
        api.get('/envios'),
        api.get('/clientes'),
        api.get('/usuarios')
      ]);
      
      // Mapear clientes para mostrar el nombre del usuario
      const usrMap = {};
      resUsr.data.forEach(u => {
        usrMap[u.id] = u.nombre;
      });

      const cliMap = {};
      resCli.data.forEach(c => {
        cliMap[c.id] = usrMap[c.usuario_id] || `Cliente #${c.id}`;
      });
      
      setClientes(cliMap);
      
      // Para la lista del select, adjuntamos el nombre
      const clisConNombre = resCli.data.map(c => ({
        ...c,
        nombreMostrar: usrMap[c.usuario_id] || `Cliente #${c.id} (RFC: ${c.rfc})`
      }));
      setClientesLista(clisConNombre);
      
      setEnvios(resEnv.data);
    } catch (error) {
      console.error("Error al cargar envíos", error);
    } finally {
      setCargando(false);
    }
  };

  const handleOpenModal = (envio = null) => {
    if (envio) {
      setEditandoId(envio.id);
      setFormData({
        cliente_id: envio.cliente_id,
        estado_actual: envio.estado_actual
      });
    } else {
      setEditandoId(null);
      setFormData({ cliente_id: '', estado_actual: 'CREADO' });
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
        await api.put(`/envios/${editandoId}`, formData);
      } else {
        await api.post('/envios', formData);
      }
      handleCloseModal();
      cargarDatos();
    } catch (error) {
      console.error("Error al guardar envio", error);
      alert("Ocurrió un error al guardar. Revise los datos requeridos por la base de datos (Ej: tarifas, direcciones obligatorias, etc).");
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este envío completo? Esta acción es destructiva.')) {
      try {
        await api.delete(`/envios/${id}`);
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
          <h1 className="page-title">Gestión de Envíos</h1>
          <p className="page-subtitle">Monitoreo general de toda la paquetería</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Crear Envío Manual
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
            <input 
              type="text" 
              placeholder="Buscar por guía o cliente..." 
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
                  <th>No. Guía</th>
                  <th>Cliente</th>
                  <th>Estado Actual</th>
                  <th>Fecha Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {envios.map(e => (
                  <tr key={e.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ background: '#f8fafc', padding: '6px', borderRadius: '6px', border: '1px solid #e2e8f0' }}><Package size={14} color="#64748b" /></div>
                        <span style={{ fontWeight: 'bold' }}>LX-{e.id.toString().padStart(4, '0')}-GT</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: '600' }}>{clientes[e.cliente_id] || `Cliente ID: ${e.cliente_id}`}</td>
                    <td>
                      {e.estado_actual === 'ENTREGADO' && <span className="badge badge-success">Entregado</span>}
                      {e.estado_actual === 'EN TRÁNSITO' && <span className="badge badge-info">En Tránsito</span>}
                      {e.estado_actual === 'CREADO' && <span className="badge" style={{background: '#f1f5f9', color: '#475569'}}>Creado</span>}
                      {e.estado_actual === 'CANCELADO' && <span className="badge" style={{background: '#fef2f2', color: '#991b1b'}}>Cancelado</span>}
                    </td>
                    <td>{new Date(e.fecha_creacion).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleOpenModal(e)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><Edit2 size={18} /></button>
                        <button onClick={() => handleEliminar(e.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {envios.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Esperando envíos...</td>
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
        title={editandoId ? "Editar Envío" : "Nuevo Envío"}
      >
        <form onSubmit={handleGuardar}>
          <div className="form-group">
            <label className="form-label">Cliente Corporativo</label>
            <select 
              className="form-input"
              value={formData.cliente_id}
              onChange={e => setFormData({...formData, cliente_id: e.target.value})}
              required
            >
              <option value="">Selecciona un cliente...</option>
              {clientesLista.map(c => (
                <option key={c.id} value={c.id}>{c.nombreMostrar}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Estado Actual</label>
            <select 
              className="form-input"
              value={formData.estado_actual}
              onChange={e => setFormData({...formData, estado_actual: e.target.value})}
            >
              <option value="CREADO">Creado (Bodega Origen)</option>
              <option value="EN TRÁNSITO">En Tránsito</option>
              <option value="ENTREGADO">Entregado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
          <div className="modal-footer" style={{ marginTop: '20px', padding: '15px 0 0 0', background: 'transparent' }}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Envío</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
