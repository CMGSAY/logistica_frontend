import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Box } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const hacerLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await api.post('/auth/login', { email, password });
      
      if (res.data.success) {
        const usuario = res.data.usuario;
        login(usuario);
        
        // Redirigir según el rol
        if (usuario.rol_id === 1) navigate('/admin');
        else if (usuario.rol_id === 2) navigate('/cliente');
        else if (usuario.rol_id === 3) navigate('/repartidor');
        else navigate('/');
        
      } else {
        setError(res.data.mensaje);
      }
    } catch (err) {
      setError("Error: Asegúrate de tener el Backend encendido.");
    }
  };

  return (
    <div style={styles.fondoGris}>
      <div style={styles.tarjetaBlanca}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#0f172a', margin: '0 0 10px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            <Box size={28} /> LOGIXTRACK
          </h2>
          <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}>● PLATAFORMA LOGÍSTICA</span>
          <h1 style={{ marginTop: '10px' }}>Iniciar sesión</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Ingresa tus credenciales para acceder al centro de control</p>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={hacerLogin}>
          <div className="form-group">
            <label className="form-label">Correo electrónico corporativo</label>
            <input 
              type="email" 
              placeholder="admin@logixtrack.com" 
              required 
              className="form-input" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Contraseña</label>
              <span style={{ color: '#3b82f6', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>¿Olvidaste tu contraseña?</span>
            </div>
            <input 
              type="password" 
              placeholder="••••••••••••" 
              required 
              className="form-input" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary" style={{width: '100%', justifyContent: 'center'}}>
            Iniciar Sesión
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#0f172a', fontWeight: 'bold' }}>¿Nuevo en LogixTrack?</p>
          <button onClick={() => navigate('/registro')} style={styles.botonSecundario}>Crear una cuenta nueva ➔</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  fondoGris: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' },
  tarjetaBlanca: { background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '400px', border: '1px solid #e2e8f0' },
  botonSecundario: { width: '100%', padding: '14px', background: 'transparent', color: '#0f172a', border: '2px solid #0f172a', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }
};