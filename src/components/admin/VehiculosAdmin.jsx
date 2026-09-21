import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Edit2, Trash2, Search, Truck } from 'lucide-react';
import Modal from '../common/Modal';

export default function VehiculosAdmin() {
  const [vehiculos, setVehiculos] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    capacidad_kg: '',
    estado: 'ACTIVO'
  });

  useEffect(() => {
    cargarVehiculos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarVehiculos = async () => {
    try {
      const res = await api.get('/vehiculos');
      setVehiculos(res.data);
    } catch (error) {
      console.error("Error al cargar vehiculos", error);
    } finally {
      setCargando(false);
    }
  };

  const handleOpenModal = (vehiculo = null) => {
    if (vehiculo) {
      setEditandoId(vehiculo.id);
      setFormData({
        placa: vehiculo.placa,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        capacidad_kg: vehiculo.capacidad_kg,
        estado: vehiculo.estado
      });
    } else {
      setEditandoId(null);
      setFormData({ placa: '', marca: '', modelo: '', capacidad_kg: '', estado: 'ACTIVO' });
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
        await api.put(`/vehiculos/${editandoId}`, formData);
      } else {
        await api.post('/vehiculos', formData);
      }
      handleCloseModal();
      cargarVehiculos();
    } catch (error) {
      console.error("Error al guardar vehículo", error);
      alert("Ocurrió un error al guardar el vehículo.");
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este vehículo?')) {
      try {
        await api.delete(`/vehiculos/${id}`);
        cargarVehiculos();
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
          <h1 className="page-title">Gestión de Flota (Vehículos)</h1>
          <p className="page-subtitle">Administra los camiones y unidades de transporte</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Registrar Vehículo
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', top: '12px', left: '12px' }} />
            <input 
              type="text" 
              placeholder="Buscar por placa o marca..." 
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
                  <th>Placa</th>
                  <th>Marca & Modelo</th>
                  <th>Capacidad (KG)</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vehiculos.map(v => (
                  <tr key={v.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '8px' }}><Truck size={16} /></div>
                        <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{v.placa}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: '600' }}>{v.marca} <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>{v.modelo}</span></td>
                    <td>{v.capacidad_kg} kg</td>
                    <td>
                      {v.estado === 'ACTIVO' ? (
                         <span className="badge badge-success">Activo</span>
                      ) : (
                         <span className="badge" style={{background: '#fef2f2', color: '#991b1b'}}>Inactivo / Taller</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleOpenModal(v)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><Edit2 size={18} /></button>
                        <button onClick={() => handleEliminar(v.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {vehiculos.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Esperando vehículos...</td>
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
        title={editandoId ? "Editar Vehículo" : "Nuevo Vehículo"}
      >
        <form onSubmit={handleGuardar}>
          <div className="form-group">
            <label className="form-label">Placa</label>
            <input 
              type="text" 
              className="form-input" 
              value={formData.placa}
              onChange={e => setFormData({...formData, placa: e.target.value})}
              required 
            />
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Marca</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.marca}
                onChange={e => setFormData({...formData, marca: e.target.value})}
                required 
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Modelo</label>
              <input 
                type="text" 
                className="form-input" 
                value={formData.modelo}
                onChange={e => setFormData({...formData, modelo: e.target.value})}
                required 
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Capacidad (KG)</label>
            <input 
              type="number" 
              step="0.01"
              className="form-input" 
              value={formData.capacidad_kg}
              onChange={e => setFormData({...formData, capacidad_kg: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select 
              className="form-input"
              value={formData.estado}
              onChange={e => setFormData({...formData, estado: e.target.value})}
            >
              <option value="ACTIVO">Activo (Disponible)</option>
              <option value="EN MANTENIMIENTO">En Mantenimiento (Taller)</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </div>
          <div className="modal-footer" style={{ marginTop: '20px', padding: '15px 0 0 0', background: 'transparent' }}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancelar</button>
            <button type="submit" className="btn-primary">Guardar Vehículo</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
