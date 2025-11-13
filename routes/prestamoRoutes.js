const express = require('express')
const router = express.Router()
const prestamoController = require('../controllers/prestamoController')

router.get('/', prestamoController.obtenerPrestamos)
router.put('/:id', prestamoController.actualizarPrestamo);
router.post('/', prestamoController.crearPrestamo)
router.delete('/:id', prestamoController.eliminarPrestamo)
module.exports = router
