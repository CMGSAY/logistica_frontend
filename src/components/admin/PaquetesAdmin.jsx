import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Search, Box } from 'lucide-react';
import Modal from '../common/Modal';

export default function PaquetesAdmin() {
  const [paquetes, setPaquetes] = useState([]);
  const [envios, setEnvios] = useState({});
  const [enviosLista, setEnviosLista] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    envio_id: '',
    tipo_empaque_id: 1, // Default, asumimos que existe el tipo 1 en BD
    peso_kg: '',
    dimensiones: '',
    contenido_declarado: '',
    valor_declarado: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resPaq, resEnv] = await Promise.all([
        api.get('/paquetes'),
        api.get('/envios')
      ]);
      
      const envMap = {};
      resEnv.data.forEach(e => {
        envMap[e.id] = `Envío #${e.id}`;
      });
      
      setEnvios(envMap);
      setEnviosLista(resEnv.data);
      setPaquetes(resPaq.data);
    } catch (error) {
      console.error("Error al cargar paquetes", error);
    } finally {
      setCargando(false);
    }
  };

  const handleOpenModal = (paquete = null) => {
    if (paquete) {
      setEditandoId(paquete.id);
      setFormData({
        envio_id: paquete.envio_id || '',
        tipo_empaque_id: paquete.tipo_empaque_id || 1,
        peso_kg: paquete.peso_kg,
        dimensiones: paquete.dimensiones,
        contenido_declarado: paquete.contenido_declarado,
        valor_declarado: paquete.valor_declarado
      });
    } else {
      setEditandoId(null);
      setFormData({ envio_id: '', tipo_empaque_id: 1, peso_kg: '', dimensiones: '', contenido_declarado: '', valor_declarado: '' });
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
        await api.put(`/paquetes/${editandoId}`, formData);
      } else {
        await api.post('/paquetes', formData);
      }
      handleCloseModal();
      cargarDatos();
    } catch (error) {
      console.error("Error al guardar paquete", error);
      alert("Ocurrió un error al guardar. Puede que falte el envío.");
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este paquete?')) {
      try {
        await api.delete(`/paquetes/${id}`);
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
          <h1 className="page-title">Gestión de Paquetes</h1>
          <p className="page-subtitle">Inventario de bultos asociados a cada envío</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Registrar Paquete
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
            <input 
              type="text" 
              placeholder="Buscar contenido o guía..." 
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
                  <th>Envío Asociado</th>
                  <th>Contenido Declarado</th>
                  <th>Peso & Dimensiones</th>
                  <th>Valor Declarado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paquetes.map(p => (
                  <tr key={p.id}>
                    <td><span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>#{p.id}</span></td>
                    <td><span className="badge badge-info">{envios[p.envio_id] || `Envío #${p.envio_id}`}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Box size={16} color="var(--text-secondary)" />
                        <span style={{ fontWeight: '600' }}>{p.contenido_declarado}</span>
                      </div>
                    </td>
                    <td>
                      {p.peso_kg} kg <br/>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.dimensiones}</span>
                    </td>
                    <td><span style={{ color: 'var(--success)', fontWeight: 'bold' }}>Q {parseFloat(p.valor_declarado).toFixed(2)}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleOpenModal(p)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><Edit2 size={18} /></button>
                        <button onClick={() => handleEliminar(p.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paquetes.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Esperando paquetes...</td>
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
        title={editandoId ? "Editar Paquete" : "Nuevo Paquete"}
      >
        <form onSubmit={handleGuardar}>
          <div className="form-group">
            <label className="form-label">Envío Asociado</label>
            <select 
              className="form-input"
              value={formData.envio_id}
              onChange={e => setFormData({...formData, envio_id: e.target.value})}
              required
            >
              <option value="">Selecciona un envío...</option>
              {enviosLista.map(e => (
                <option key={e.id} value={e.id}>Envío #{e.id} - {e.estado_actual}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Contenido Declarado</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.contenido_declarado}
              onChange={e => setFormData({...formData, contenido_declarado: e.target.value})}
              required 
            />
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Peso (kg)</label>
              <input 
                type="number"
                step="0.01" 
                className="form-input" 
                value={formData.peso_kg}
                onChange={e => setFormData({...formData, peso_kg: e.target.value})}
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Dimensiones</label>
              <input 
                type="text" 
                placeholder="Ej. 30x40x50 cm"
                className="form-input" 
                value={formData.dimensiones}
                onChange={e => setFormData({...formData, dimensiones: e.target.value})}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Valor Declarado (Q)</label>
            <input 
              type="number" 
              step="0.01"
              className="form-input" 
              value={formData.valor_declarado}
              onChange={e => setFormData({...formData, valor_declarado: e.target.value})}
            />
          </div>
          <div className="modal-footer" style={{ marginTop: '20px', padding: '15px 0 0 0', background: 'transparent' }}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Paquete</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
