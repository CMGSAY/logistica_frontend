Treating warnings as errors because process.env.CI = true.
Most CI servers set it automatically.
Failed to compile.
[eslint] 
src/components/admin/DashboardAdmin.jsx
  Line 2:48:  'ArrowUpRight' is defined but never used    no-unused-vars
  Line 2:62:  'ArrowDownRight' is defined but never used  no-unused-vars
src/components/cliente/CotizadorCliente.jsx
  Line 27:6:  React Hook useEffect has a missing dependency: 'cargarDatos'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
src/components/repartidor/PortalRepartidor.jsx
  Line 26:6:  React Hook useEffect has a missing dependency: 'cargarRutaAsignada'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
src/layouts/MainLayout.jsx
  Line 4:59:  'FileText' is defined but never used  no-unused-vars
  Line 4:69:  'Settings' is defined but never used  no-unused-vars
Error: Command "npm run build" exited with 1
