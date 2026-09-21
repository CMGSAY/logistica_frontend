
> frontend_logistica@0.1.0 build
> react-scripts build
(node:116) [DEP0176] DeprecationWarning: fs.F_OK is deprecated, use fs.constants.F_OK instead
(Use `node --trace-deprecation ...` to show where the warning was created)
Creating an optimized production build...
Treating warnings as errors because process.env.CI = true.
Most CI servers set it automatically.
Failed to compile.
[eslint] 
src/components/cliente/CotizadorCliente.jsx
  Line 27:6:  React Hook useEffect has a missing dependency: 'cargarDatos'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
src/components/repartidor/PortalRepartidor.jsx
  Line 26:6:  React Hook useEffect has a missing dependency: 'cargarRutaAsignada'. Either include it or remove the dependency array  react-hooks/exhaustive-deps
Error: Command "npm run build" exited with 1