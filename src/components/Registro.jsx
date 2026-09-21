import React, { useState } from 'react';

export default function Registro({ setVista }) {
  const [formData, setFormData] = useState({ nombre: '', email: '', password: '', telefono: '' });

  const registrarUsuario = async (e) => {
    e.preventDefault();

    try {
      // Mandamos la info al controlador de usuarios
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';
      const res = await fetch(`${backendUrl}/api/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          password_hash: formData.password,
          rol_id: 2 // <--- AUTOMÁTICO: Le asignamos el ID 2 (Cliente)
        })
      });
      
      if (res.ok) {
        alert("¡Cuenta creada exitosamente! Ahora inicia sesión.");
        setVista('login');
      } else {
        alert("El backend rechazó los datos. Revisa la consola de tu backend.");
      }
    } catch (error) {
      alert("Error crítico de conexión.");
    }
  };

  return (
    <div style={styles.fondoGris}>
      <div style={{ ...styles.tarjetaBlanca, maxWidth: '500px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#0f172a', margin: '0 0 5px 0' }}>📦 LOGIXTRACK</h2>
          <span style={{ color: '#3b82f6', fontSize: '12px', fontWeight: 'bold' }}>● REGISTRO DE CLIENTES</span>
          <h1 style={{ marginTop: '10px' }}>Crea tu cuenta</h1>
          <p style={{ color: '#64748b', fontSize: '14px', cursor: 'pointer' }} onClick={() => setVista('login')}>
            ¿Ya tienes una cuenta registrada? <span style={{ color: '#3b82f6' }}>Inicia sesión aquí ➔</span>
          </p>
        </div>

        <form onSubmit={registrarUsuario}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Nombre Completo o Razón Social *</label>
            <input type="text" placeholder="ej. Distribuidora S.A." required style={styles.input} 
                   onChange={e => setFormData({...formData, nombre: e.target.value})} />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo Electrónico *</label>
            <input type="email" placeholder="logistica@empresa.com" required style={styles.input} 
                   onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña *</label>
            <input type="password" placeholder="••••••••••••" required style={styles.input} 
                   onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Teléfono</label>
            <input type="tel" placeholder="+52 55 0000 0000" style={styles.input} 
                   onChange={e => setFormData({...formData, telefono: e.target.value})} />
          </div>

          <button type="submit" style={{ ...styles.botonOscuro, marginTop: '20px' }}>Crear Cuenta</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  fondoGris: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px', fontFamily: 'system-ui, sans-serif' },
  tarjetaBlanca: { background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', width: '100%' },
  inputGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', boxSizing: 'border-box' },
  botonOscuro: { width: '100%', padding: '14px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }
};