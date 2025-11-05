const express = require('express')
const router = express.Router()
const pagoController = require('../controllers/pagoController')

router.get('/', pagoController.obtenerPagos)
router.post('/', pagoController.crearPago)

module.exports = router
