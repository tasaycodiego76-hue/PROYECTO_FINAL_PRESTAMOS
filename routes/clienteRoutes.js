const express = require('express')
const router = express.Router()
const clienteController = require('../controllers/clienteController')

router.get('/', clienteController.obtenerClientes)
router.get('/inactivos', clienteController.obtenerClientesInactivos)
router.post('/', clienteController.crearCliente)
router.put('/:id', clienteController.actualizarCliente)
router.delete('/:id', clienteController.eliminarCliente)
router.patch('/:id/reactivar', clienteController.reactivarCliente)

module.exports = router