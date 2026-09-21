import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';
const socket = io(backendUrl);

const TABLAS = [
  'usuarios', 'roles', 'clientes', 'conductores', 'vehiculos', 
  'almacenes', 'zonas_cobertura', 'tarifas', 'tipos_empaque', 'direcciones', 
  'paquetes', 'envios', 'rutas', 'asignaciones_ruta', 'checkpoints', 
  'metodos_pago', 'facturas', 'pagos', 'incidencias', 'mantenimientos', 
  'logs_sistema', 'auditoria_acciones'
];

export default function Dashboard({ setVista }) {
  const [tablaActiva, setTablaActiva] = useState('usuarios');
  const [datosTabla, setDatosTabla] = useState([]);
  
  const [conectado, setConectado] = useState(false);
  const [usuariosActivos, setUsuariosActivos] = useState(0); 
  const [mensajes, setMensajes] = useState([]); 
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [escribiendo, setEscribiendo] = useState(''); 
  const [notificaciones, setNotificaciones] = useState([]); 

  useEffect(() => {
    fetch(`${backendUrl}/api/${tablaActiva}`)
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setDatosTabla(data) : setDatosTabla([]))
      .catch(err => console.error(err));
  }, [tablaActiva]);

  useEffect(() => {
    socket.on('connect', () => setConectado(true));
    socket.on('disconnect', () => setConectado(false));
    socket.on('usuarios_activos', (cantidad) => setUsuariosActivos(cantidad));
    socket.on('nuevo_mensaje', (mensaje) => setMensajes((prev) => [...prev, mensaje]));
    socket.on('usuario_escribiendo', (texto) => setEscribiendo(texto));
    socket.on('alerta_sistema', (alerta) => setNotificaciones((prev) => [alerta, ...prev]));
    return () => { socket.off(); };
  }, []);

  const enviarMensaje = (e) => {
    e.preventDefault();
    if (nuevoMensaje.trim()) {
      socket.emit('enviar_mensaje', nuevoMensaje);
      setNuevoMensaje('');
      socket.emit('escribiendo', false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* MENÚ LATERAL */}
      <div style={{ width: '250px', background: '#0f172a', color: 'white', overflowY: 'auto' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #1e293b' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>📦 LOGIXTRACK</h2>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Panel de Control</span>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {TABLAS.map(tabla => (
            <li key={tabla} onClick={() => setTablaActiva(tabla)}
              style={{ padding: '15px 20px', cursor: 'pointer', background: tablaActiva === tabla ? '#1e293b' : 'transparent', borderBottom: '1px solid #1e293b', textTransform: 'capitalize' }}>
              📊 {tabla.replace('_', ' ')}
            </li>
          ))}
          <li onClick={() => setVista('login')} style={{ padding: '15px 20px', cursor: 'pointer', color: '#ef4444', marginTop: '20px' }}>
            🚪 Cerrar Sesión
          </li>
        </ul>
      </div>

      {/* ÁREA PRINCIPAL */}
      <div style={{ flex: 1, padding: '30px', background: '#f8fafc', overflowY: 'auto' }}>
        
        {/* BARRA SUPERIOR WEBSOCKETS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <div>
            <h2 style={{ margin: 0 }}>Panel de Control</h2>
            <p style={{ margin: '5px 0 0 0', color: conectado ? 'green' : 'red' }}>
              Servidor: {conectado ? '🟢 Online' : '🔴 Offline'} | 👥 Usuarios activos: {usuariosActivos}
            </p>
          </div>
          <button onClick={() => socket.emit('cambio_estado_paquete', `¡Alerta! Movimiento a las ${new Date().toLocaleTimeString()}`)} style={{ padding: '10px 20px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Enviar Alerta Global
          </button>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          
          {/* TABLA DE BASE DE DATOS */}
          <div style={{ flex: 2, background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h3 style={{ textTransform: 'capitalize' }}>Tabla: {tablaActiva.replace('_', ' ')}</h3>
            {datosTabla.length === 0 ? (
              <p style={{ color: 'gray' }}>No hay registros o falta conectarla en el backend.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', color: '#334155' }}>
                      {Object.keys(datosTabla[0]).map(col => <th key={col} style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>{col}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {datosTabla.map((fila, index) => (
                      <tr key={index}>
                        {Object.values(fila).map((val, i) => <td key={i} style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>{val?.toString() || 'N/A'}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* CHAT */}
          <div style={{ flex: 1, background: 'white', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <h3>💬 Chat y Alertas</h3>
            {notificaciones.length > 0 && (
              <div style={{ background: '#fff3cd', color: '#856404', padding: '10px', marginBottom: '15px', borderRadius: '5px' }}>
                <strong>🔔 Última alerta:</strong> {notificaciones[0]}
              </div>
            )}
            <div style={{ height: '300px', overflowY: 'scroll', background: '#f8f9fa', padding: '15px', borderRadius: '5px', marginBottom: '10px', border: '1px solid #eee' }}>
              {mensajes.map((msg, i) => <div key={i} style={{ padding: '8px', borderBottom: '1px solid #eee' }}>💬 {msg}</div>)}
              {escribiendo && <small style={{ color: '#888' }}><i>{escribiendo}</i></small>}
            </div>
            <form onSubmit={enviarMensaje} style={{ display: 'flex' }}>
              <input type="text" value={nuevoMensaje} onChange={(e) => { setNuevoMensaje(e.target.value); socket.emit('escribiendo', e.target.value.length > 0); }} placeholder="Escribe..." style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px 0 0 4px' }} />
              <button type="submit" style={{ padding: '10px 15px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '0 4px 4px 0', cursor: 'pointer' }}>Enviar</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}