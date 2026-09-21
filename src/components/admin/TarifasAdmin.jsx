import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Search, Wallet } from 'lucide-react';
import Modal from '../common/Modal';

export default function TarifasAdmin() {
  const [tarifas, setTarifas] = useState([]);
  const [zonas, setZonas] = useState({});
  const [zonasLista, setZonasLista] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    zona_id: '',
    peso_maximo_kg: '',
    precio: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resTarifas, resZonas] = await Promise.all([
        api.get('/tarifas'),
        api.get('/zonas_cobertura')
      ]);
      
      const zonasMap = {};
      resZonas.data.forEach(z => {
        zonasMap[z.id] = z.nombre;
      });
      
      setZonas(zonasMap);
      setZonasLista(resZonas.data);
      setTarifas(resTarifas.data);
    } catch (error) {
      console.error("Error al cargar tarifas", error);
    } finally {
      setCargando(false);
    }
  };

  const handleOpenModal = (tarifa = null) => {
    if (tarifa) {
      setEditandoId(tarifa.id);
      setFormData({
        zona_id: tarifa.zona_id,
        peso_maximo_kg: tarifa.peso_maximo_kg,
        precio: tarifa.precio
      });
    } else {
      setEditandoId(null);
      setFormData({ zona_id: '', peso_maximo_kg: '', precio: '' });
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
        await api.put(`/tarifas/${editandoId}`, formData);
      } else {
        await api.post('/tarifas', formData);
      }
      handleCloseModal();
      cargarDatos();
    } catch (error) {
      console.error("Error al guardar tarifa", error);
      alert("Ocurrió un error al guardar.");
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta tarifa?')) {
      try {
        await api.delete(`/tarifas/${id}`);
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
          <h1 className="page-title">Tabulador de Tarifas</h1>
          <p className="page-subtitle">Configura los precios según zona y peso</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Nueva Tarifa
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
            <input 
              type="text" 
              placeholder="Buscar tarifa..." 
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
                  <th>Zona de Cobertura</th>
                  <th>Peso Máximo (KG)</th>
                  <th>Precio (Q)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tarifas.map(t => (
                  <tr key={t.id}>
                    <td><span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>#{t.id}</span></td>
                    <td>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        {zonas[t.zona_id] || `Zona ID: ${t.zona_id}`}
                      </span>
                    </td>
                    <td>Hasta {t.peso_maximo_kg} kg</td>
                    <td>
                      <span style={{ color: 'var(--success)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Wallet size={16} /> Q {parseFloat(t.precio).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleOpenModal(t)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><Edit2 size={18} /></button>
                        <button onClick={() => handleEliminar(t.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {tarifas.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Esperando tarifas...</td>
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
        title={editandoId ? "Editar Tarifa" : "Nueva Tarifa"}
      >
        <form onSubmit={handleGuardar}>
          <div className="form-group">
            <label className="form-label">Zona de Cobertura</label>
            <select 
              className="form-input"
              value={formData.zona_id}
              onChange={e => setFormData({...formData, zona_id: e.target.value})}
              required
            >
              <option value="">Selecciona una zona...</option>
              {zonasLista.map(z => (
                <option key={z.id} value={z.id}>{z.nombre}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Peso Máx. Soportado (kg)</label>
              <input 
                type="number"
                step="0.01" 
                className="form-input" 
                value={formData.peso_maximo_kg}
                onChange={e => setFormData({...formData, peso_maximo_kg: e.target.value})}
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Precio Base (Q)</label>
              <input 
                type="number" 
                step="0.01"
                className="form-input" 
                value={formData.precio}
                onChange={e => setFormData({...formData, precio: e.target.value})}
                required 
              />
            </div>
          </div>
          <div className="modal-footer" style={{ marginTop: '20px', padding: '15px 0 0 0', background: 'transparent' }}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Tarifa</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
