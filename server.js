const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs').promises

// Rutas
const clienteRoutes = require('./routes/clienteRoutes')
const prestamoRoutes = require('./routes/prestamoRoutes')
const pagoRoutes = require('./routes/pagoRoutes')

const app = express()
const PORT = process.env.PORT || 3000

// Configuración CORS
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}))
// Servir carpeta uploads de forma pública
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));





// Middleware
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// Rutas de frontend
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')))
app.get('/prestamos', (req, res) => res.sendFile(path.join(__dirname, 'public', 'prestamos.html')))
app.get('/pagos', (req, res) => res.sendFile(path.join(__dirname, 'public', 'pagos.html')))

// Rutas API
app.use('/api/clientes', clienteRoutes)
app.use('/api/prestamos', prestamoRoutes)
app.use('/api/pagos', pagoRoutes)

// Iniciar servidor
app.listen(PORT, () => console.log(`Servidor iniciado en http://localhost:${PORT}`))
