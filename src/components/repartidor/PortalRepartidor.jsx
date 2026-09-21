import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { MapPin, Navigation, CheckCircle2, AlertTriangle, Truck } from 'lucide-react';
import Modal from '../common/Modal';
import { io } from 'socket.io-client';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';
const socket = io(backendUrl);
export default function PortalRepartidor() {
  const { user } = useContext(AuthContext);
  const [rutaActiva, setRutaActiva] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Modales
  const [modalCheckpoint, setModalCheckpoint] = useState(false);
  const [modalIncidencia, setModalIncidencia] = useState(false);

  // States Formularios
  const [formCheckpoint, setFormCheckpoint] = useState({ ubicacion_actual: '', estado: 'EN RUTA', observaciones: '' });
  const [formIncidencia, setFormIncidencia] = useState({ tipo_incidencia: 'RETRASO', descripcion: '', nivel_gravedad: 'MEDIA' });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarRutaAsignada();
    // eslint-disable-next-line
  }, []);

  const cargarRutaAsignada = async () => {
    try {
      const resCond = await api.get('/conductores');
      const miConductor = resCond.data.find(c => c.usuario_id === user.id);
      
      if (miConductor) {
        const resAsig = await api.get('/asignaciones_ruta');
        const asignacion = resAsig.data.find(a => a.conductor_id === miConductor.id);
        
        if (asignacion) {
          setRutaActiva(asignacion);
        }
      }
    } catch (error) {
      console.error("Error al cargar la ruta", error);
    } finally {
      setCargando(false);
    }
  };

  const handleRegistrarCheckpoint = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const payload = {
        asignacion_id: rutaActiva.id,
        ...formCheckpoint
      };
      await api.post('/checkpoints', payload);
      
      socket.emit('nuevo_checkpoint', {
        ubicacion: formCheckpoint.ubicacion_actual,
        estado: formCheckpoint.estado,
        conductor: user.nombre
      });

      alert("Checkpoint registrado exitosamente en el sistema central.");
      setModalCheckpoint(false);
      setFormCheckpoint({ ubicacion_actual: '', estado: 'EN RUTA', observaciones: '' });
    } catch (error) {
      console.error("Error al registrar checkpoint", error);
      alert("Ocurrió un error al registrar. Revisa tu conexión.");
    } finally {
      setGuardando(false);
    }
  };

  const handleReportarIncidencia = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const payload = {
        asignacion_id: rutaActiva.id,
        ...formIncidencia
      };
      await api.post('/incidencias', payload);
      
      socket.emit('nueva_incidencia', {
        tipo: formIncidencia.tipo_incidencia,
        nivel: formIncidencia.nivel_gravedad,
        conductor: user.nombre
      });

      alert("Incidencia reportada. El equipo de monitoreo ha sido alertado.");
      setModalIncidencia(false);
      setFormIncidencia({ tipo_incidencia: 'RETRASO', descripcion: '', nivel_gravedad: 'MEDIA' });
    } catch (error) {
      console.error("Error al reportar incidencia", error);
      alert("Ocurrió un error al reportar.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <div style={{ padding: '40px' }}>Cargando información de la ruta...</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mi Ruta Activa</h1>
          <p className="page-subtitle">Monitoreo y registro de avance en tiempo real</p>
        </div>
      </div>

      {!rutaActiva ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '50%', display: 'inline-block', marginBottom: '20px' }}>
            <Navigation size={48} color="var(--text-secondary)" />
          </div>
          <h2>Esperando asignación de ruta...</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Cuando el administrador te asigne un vehículo y una ruta, aparecerá aquí.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '25px' }}>
          
          {/* MAPA Y DETALLES */}
          <div>
            <div className="card" style={{ background: '#0f172a', color: 'white', border: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <span style={{ color: 'var(--accent-primary)', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>VIAJE EN CURSO</span>
                  <h2 style={{ margin: '5px 0' }}>Asignación #{rutaActiva.id} (Ruta #{rutaActiva.ruta_id})</h2>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>VEHÍCULO</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                    <Truck size={16} /> Unidad {rutaActiva.vehiculo_id}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px 0', borderTop: '1px solid #1e293b' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <MapPin size={24} color="white" />
                    <div style={{ width: '2px', height: '40px', background: 'var(--accent-primary)', margin: '5px 0' }}></div>
                  </div>
                  <div>
                    <h3 style={{ margin: 0 }}>Origen</h3>
                    <p style={{ color: 'var(--text-light)', margin: '5px 0 0 0', fontSize: '14px' }}>Salida Programada: {new Date(rutaActiva.fecha_salida_programada).toLocaleString()}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <MapPin size={24} color="var(--accent-primary)" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0 }}>Destino</h3>
                    <p style={{ color: 'var(--text-light)', margin: '5px 0 0 0', fontSize: '14px' }}>Llegada Estimada: {new Date(rutaActiva.fecha_llegada_estimada).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
               <h3 style={{ marginTop: 0 }}>Actualizar Estado (Checkpoints)</h3>
               <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>Registra tu avance en la ruta para notificar al sistema central.</p>
               
               <button className="btn-primary" onClick={() => setModalCheckpoint(true)} style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '16px' }}>
                 <CheckCircle2 size={20} /> Registrar Checkpoint Actual
               </button>
            </div>
          </div>

          {/* MENÚ DE ACCIONES RÁPIDAS */}
          <div>
            <div className="card">
              <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Acciones Operativas</h3>
              
              <button onClick={() => setModalIncidencia(true)} style={{ width: '100%', padding: '15px', display: 'flex', alignItems: 'center', gap: '12px', background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                <AlertTriangle size={18} /> Reportar Incidencia
              </button>
              
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '10px' }}>
                Usa este botón solo en caso de accidentes, bloqueos o retrasos mayores a 2 horas.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* MODAL CHECKPOINT */}
      <Modal isOpen={modalCheckpoint} onClose={() => setModalCheckpoint(false)} title="Registrar Checkpoint Físico">
        <form onSubmit={handleRegistrarCheckpoint}>
          <div className="form-group">
            <label className="form-label">Ubicación Actual (Ciudad, Carretera, etc.)</label>
            <input 
              type="text" 
              className="form-input" 
              value={formCheckpoint.ubicacion_actual}
              onChange={e => setFormCheckpoint({...formCheckpoint, ubicacion_actual: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Estado del Viaje</label>
            <select 
              className="form-input"
              value={formCheckpoint.estado}
              onChange={e => setFormCheckpoint({...formCheckpoint, estado: e.target.value})}
            >
              <option value="EN RUTA">En Ruta Normal</option>
              <option value="LLEGADA ORIGEN">Llegada a Origen / Carga</option>
              <option value="LLEGADA DESTINO">Llegada a Destino / Descarga</option>
              <option value="COMPLETADO">Viaje Completado</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Observaciones (Opcional)</label>
            <input 
              type="text" 
              className="form-input" 
              value={formCheckpoint.observaciones}
              onChange={e => setFormCheckpoint({...formCheckpoint, observaciones: e.target.value})}
            />
          </div>
          <div className="modal-footer" style={{ marginTop: '20px', padding: '15px 0 0 0', background: 'transparent' }}>
            <button type="button" className="btn-secondary" onClick={() => setModalCheckpoint(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={guardando}>Guardar Checkpoint</button>
          </div>
        </form>
      </Modal>

      {/* MODAL INCIDENCIA */}
      <Modal isOpen={modalIncidencia} onClose={() => setModalIncidencia(false)} title="Reportar Incidencia Operativa">
        <form onSubmit={handleReportarIncidencia}>
          <div className="form-group">
            <label className="form-label">Tipo de Incidencia</label>
            <select 
              className="form-input"
              value={formIncidencia.tipo_incidencia}
              onChange={e => setFormIncidencia({...formIncidencia, tipo_incidencia: e.target.value})}
            >
              <option value="RETRASO">Retraso Operativo</option>
              <option value="ACCIDENTE">Accidente de Tránsito</option>
              <option value="FALLA_MECANICA">Falla Mecánica / Desperfecto</option>
              <option value="BLOQUEO">Bloqueo Carretero / Tráfico Pesado</option>
              <option value="OTRO">Otro (Especificar)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Nivel de Gravedad</label>
            <select 
              className="form-input"
              value={formIncidencia.nivel_gravedad}
              onChange={e => setFormIncidencia({...formIncidencia, nivel_gravedad: e.target.value})}
            >
              <option value="BAJA">Baja (Retraso menor a 1 hr)</option>
              <option value="MEDIA">Media (Impacta itinerario pero se puede continuar)</option>
              <option value="ALTA">Alta (Imposibilidad de moverse, requiere asistencia)</option>
              <option value="CRITICA">Crítica (Siniestro mayor, pérdida de mercancía)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Descripción de los Hechos</label>
            <textarea 
              className="form-input" 
              rows="4"
              value={formIncidencia.descripcion}
              onChange={e => setFormIncidencia({...formIncidencia, descripcion: e.target.value})}
              required 
            ></textarea>
          </div>
          <div className="modal-footer" style={{ marginTop: '20px', padding: '15px 0 0 0', background: 'transparent' }}>
            <button type="button" className="btn-secondary" onClick={() => setModalIncidencia(false)}>Cancelar</button>
            <button type="submit" className="btn-primary" style={{ background: 'var(--danger)' }} disabled={guardando}>
              Enviar Alerta a Central
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
