import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Box } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

export default function CotizadorCliente() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [direcciones, setDirecciones] = useState([]);
  const [tiposEmpaque, setTiposEmpaque] = useState([]);
  const [clienteId, setClienteId] = useState(null);
  
  // States del formulario
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [empaqueSeleccionado, setEmpaqueSeleccionado] = useState(null);
  
  const [dimensiones, setDimensiones] = useState({ largo: 45, ancho: 30, alto: 25 });
  const [peso, setPeso] = useState(14.5);
  const [contenido, setContenido] = useState('Mercancía General');
  
  const [creando, setCreando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resDir, resEmp, resCli] = await Promise.all([
        api.get('/direcciones'),
        api.get('/tipos_empaque'),
        api.get('/clientes')
      ]);
      setDirecciones(resDir.data);
      setTiposEmpaque(resEmp.data);
      
      if(resEmp.data.length > 0) setEmpaqueSeleccionado(resEmp.data[0].id);
      
      // Buscar el cliente que corresponde al usuario logueado
      const miCliente = resCli.data.find(c => c.usuario_id === user.id);
      if(miCliente) {
        setClienteId(miCliente.id);
      } else {
        console.warn("Este usuario no tiene un perfil de cliente corporativo creado en la BD.");
      }
    } catch (error) {
      console.error("Error al cargar datos del cotizador", error);
    }
  };

  const handleCrearEnvio = async () => {
    if(!origen || !destino) {
      alert('Por favor selecciona una dirección de origen y una de destino.');
      return;
    }
    if(!clienteId) {
      alert('Error: Tu usuario no tiene un perfil de Cliente Corporativo asignado. Contacta a soporte o al Administrador.');
      return;
    }

    setCreando(true);
    try {
      // 1. Crear el Envío
      const payloadEnvio = {
        cliente_id: clienteId,
        tarifa_id: 1, 
        direccion_origen_id: parseInt(origen),
        direccion_destino_id: parseInt(destino),
        estado_actual: 'CREADO'
      };
      const resEnvio = await api.post('/envios', payloadEnvio);
      const envioNuevoId = resEnvio.data.insertId;

      // 2. Crear el Paquete asociado al Envío
      const payloadPaquete = {
        envio_id: envioNuevoId,
        tipo_empaque_id: empaqueSeleccionado,
        peso_kg: parseFloat(peso),
        dimensiones: `${dimensiones.largo}x${dimensiones.ancho}x${dimensiones.alto} cm`,
        contenido_declarado: contenido,
        valor_declarado: 0
      };
      await api.post('/paquetes', payloadPaquete);
      
      alert(`¡Éxito! Tu envío ha sido registrado con la guía LX-${envioNuevoId.toString().padStart(4, '0')}-GT`);
      navigate('/cliente');
    } catch (error) {
      console.error("Error al generar el envío", error);
      alert("Hubo un error al generar la etiqueta. Por favor revisa tu conexión.");
    } finally {
      setCreando(false);
    }
  };

  const getCiudad = (dirId) => {
    const d = direcciones.find(x => x.id === parseInt(dirId));
    return d ? d.ciudad : 'Guatemala';
  };

  return (
    <div style={{ display: 'flex', gap: '25px', alignItems: 'flex-start' }}>
      
      {/* FORMULARIO IZQUIERDO */}
      <div style={{ flex: 2 }}>
         <div className="page-header">
           <h1 className="page-title">Nuevo Envío & Cotizador (Guatemala)</h1>
           <button className="btn-primary" onClick={() => navigate('/cliente')} style={{background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)'}}>
              Volver a Mis Envíos
           </button>
         </div>
         
         <div className="card">
            <h3 style={{ marginTop: 0 }}>1. Especificaciones del Paquete</h3>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
               {tiposEmpaque.map(tipo => (
                 <div 
                   key={tipo.id} 
                   onClick={() => setEmpaqueSeleccionado(tipo.id)}
                   style={empaqueSeleccionado === tipo.id ? {...styles.cajaSelect, ...styles.cajaSelectActiva} : styles.cajaSelect}
                 >
                   <Box size={24} style={{ marginBottom: '8px' }} /><br/>
                   {tipo.nombre}<br/><small>{tipo.material}</small>
                 </div>
               ))}
               {tiposEmpaque.length === 0 && <div style={{ color: 'var(--text-secondary)' }}>Cargando tipos de empaque desde BD...</div>}
            </div>
            
            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
               <div style={{ flex: 1 }}>
                 <label className="form-label">Largo (cm)</label>
                 <input type="number" value={dimensiones.largo} onChange={e=>setDimensiones({...dimensiones, largo: e.target.value})} className="form-input"/>
               </div>
               <div style={{ flex: 1 }}>
                 <label className="form-label">Ancho (cm)</label>
                 <input type="number" value={dimensiones.ancho} onChange={e=>setDimensiones({...dimensiones, ancho: e.target.value})} className="form-input"/>
               </div>
               <div style={{ flex: 1 }}>
                 <label className="form-label">Alto (cm)</label>
                 <input type="number" value={dimensiones.alto} onChange={e=>setDimensiones({...dimensiones, alto: e.target.value})} className="form-input"/>
               </div>
               <div style={{ flex: 1 }}>
                 <label className="form-label">Peso (kg)</label>
                 <input type="number" step="0.1" value={peso} onChange={e=>setPeso(e.target.value)} className="form-input"/>
               </div>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
               <div style={{ flex: 1 }}>
                 <label className="form-label">Contenido Declarado</label>
                 <input type="text" value={contenido} onChange={e=>setContenido(e.target.value)} placeholder="Ej. Documentos, Refacciones..." className="form-input"/>
               </div>
            </div>
         </div>

         <div className="card">
            <h3 style={{ marginTop: 0 }}>2. Origen y Destino Nacional (GT)</h3>
            <div style={{ display: 'flex', gap: '15px' }}>
               <div style={{ flex: 1 }}>
                 <label className="form-label">Dirección de Origen</label>
                 <select className="form-input" value={origen} onChange={(e) => setOrigen(e.target.value)}>
                   <option value="">Seleccione una dirección guardada...</option>
                   {direcciones.map(d => (
                     <option key={d.id} value={d.id}>{d.calle} {d.numero_exterior}, {d.ciudad}, {d.estado} - CP: {d.codigo_postal}</option>
                   ))}
                 </select>
               </div>
               <div style={{ flex: 1 }}>
                 <label className="form-label">Dirección de Destino</label>
                 <select className="form-input" value={destino} onChange={(e) => setDestino(e.target.value)}>
                   <option value="">Seleccione una dirección guardada...</option>
                   {direcciones.map(d => (
                     <option key={d.id} value={d.id}>{d.calle} {d.numero_exterior}, {d.ciudad}, {d.estado} - CP: {d.codigo_postal}</option>
                   ))}
                 </select>
               </div>
            </div>
            {direcciones.length === 0 && <p style={{fontSize: '12px', color: 'var(--danger)', marginTop: '10px'}}>Atención: No hay direcciones registradas en la base de datos. Ve a la sección de Direcciones para crear una.</p>}
         </div>
      </div>

      {/* TICKET DERECHO: COTIZACIÓN */}
      <div style={{ flex: 1 }}>
         <div style={{ background: 'var(--bg-sidebar)', color: 'white', padding: '25px', borderRadius: '12px', position: 'sticky', top: '20px' }}>
            <span style={{ fontSize: '12px', color: 'var(--info)', fontWeight: 'bold', letterSpacing: '1px' }}>● COTIZACIÓN EN VIVO</span>
            <h2 style={{ margin: '10px 0', borderBottom: '1px solid #1e293b', paddingBottom: '15px' }}>
              {origen ? getCiudad(origen) : 'Origen'} ➔ {destino ? getCiudad(destino) : 'Destino'}
            </h2>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '15px 0', fontSize: '14px', color: 'var(--text-light)' }}>
               <span>Tarifa Base (hasta 15kg)</span> <span>Q 45.00 GTQ</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '15px 0', fontSize: '14px', color: 'var(--text-light)' }}>
               <span>Seguro de Mercancía</span> <span>Q 10.00 GTQ</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '15px 0', fontSize: '14px', color: 'var(--text-light)' }}>
               <span>IVA (12%)</span> <span>Q 6.60 GTQ</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '20px 0 0 0', paddingTop: '20px', borderTop: '1px solid #1e293b', fontSize: '24px', fontWeight: 'bold', color: 'var(--success)' }}>
               <span>TOTAL</span> <span>Q 61.60</span>
            </div>

            <button 
              onClick={handleCrearEnvio}
              disabled={creando}
              style={{ width: '100%', padding: '15px', marginTop: '25px', background: creando ? 'var(--text-secondary)' : 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: creando ? 'not-allowed' : 'pointer' }}
            >
               {creando ? 'Generando Etiqueta...' : 'Generar Envío y Etiqueta ➔'}
            </button>
         </div>
      </div>

    </div>
  );
}

const styles = {
  cajaSelect: { flex: 1, border: '1px solid var(--border-color)', padding: '20px', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', color: 'var(--text-secondary)', background: 'var(--bg-primary)' },
  cajaSelectActiva: { border: '2px solid var(--accent-primary)', background: 'var(--info-bg)', color: 'var(--info-text)', fontWeight: 'bold' }
};
