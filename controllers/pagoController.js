const db = require('../config/db')

// Registrar pago
exports.crearPago = async (req, res) => {
  const { prestamoId, montoPagado, fechaPago, metodoPago } = req.body

  if (!prestamoId || !montoPagado || !fechaPago || !metodoPago) {
    return res.status(400).json({ mensaje: 'Faltan datos obligatorios' })
  }

  const sqlPago = "INSERT INTO pagos (prestamoId, montoPagado, fechaPago, metodoPago) VALUES (?,?,?,?)"

  try {
    const [result] = await db.query(sqlPago, [prestamoId, montoPagado, fechaPago, metodoPago])
    // Actualizar saldo pendiente del préstamo
    const sqlUpdate = 'UPDATE prestamos SET saldoPendiente = saldoPendiente - ? WHERE id = ?'
    await db.query(sqlUpdate, [montoPagado, prestamoId])
    res.status(201).json({ id: result.insertId, mensaje: 'Pago registrado correctamente' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ mensaje: 'Error al registrar pago' })
  }
}

// Listar pagos
exports.obtenerPagos = async (req, res) => {
  const sql = `
    SELECT pa.id, c.nombre AS cliente, pr.montoPrestado, pa.montoPagado, pa.fechaPago, pa.metodoPago
    FROM pagos pa
    INNER JOIN prestamos pr ON pa.prestamoId = pr.id
    INNER JOIN clientes c ON pr.clienteId = c.id
    ORDER BY pa.id DESC
  `
  try {
    const [pagos] = await db.query(sql)
    res.status(200).json(pagos)
  } catch (e) {
    console.error(e)
    res.status(500).json({ mensaje: 'Error al obtener pagos' })
  }
}
