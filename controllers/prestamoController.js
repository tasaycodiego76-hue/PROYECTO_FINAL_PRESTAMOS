const db = require('../config/db')

// Crear préstamo
exports.crearPrestamo = async (req, res) => {
  const { clienteId, montoPrestado, saldoPendiente, fechaPrestamo } = req.body

  if (!clienteId || !montoPrestado || !fechaPrestamo) {
    return res.status(400).json({ mensaje: 'Faltan datos obligatorios' })
  }

  const sql = "INSERT INTO prestamos (clienteId, montoPrestado, saldoPendiente, fechaPrestamo) VALUES (?,?,?,?)"

  try {
    const [result] = await db.query(sql, [clienteId, montoPrestado, saldoPendiente, fechaPrestamo])
    res.status(201).json({ id: result.insertId, mensaje: 'Préstamo registrado correctamente' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ mensaje: 'Error al registrar préstamo' })
  }
}

exports.actualizarPrestamo = async (req, res) => {
  const { id } = req.params
  const { clienteId, montoPrestado, fechaPrestamo } = req.body
  
  const sql = 'UPDATE prestamos SET clienteId = ?, montoPrestado = ?, fechaPrestamo = ? WHERE id = ?'
  
  try {
    const [result] = await db.query(sql, [clienteId, montoPrestado, fechaPrestamo, id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Préstamo no encontrado' })
    }
    res.status(200).json({ mensaje: 'Préstamo actualizado correctamente' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ mensaje: 'Error al actualizar préstamo' })
  }
}

// Listar préstamos con nombre del cliente
exports.obtenerPrestamos = async (req, res) => {
  const sql = `
    SELECT p.id, p.clienteId, c.nombre AS cliente, p.montoPrestado, p.saldoPendiente, p.fechaPrestamo
    FROM prestamos p
    INNER JOIN clientes c ON p.clienteId = c.id
    ORDER BY p.id DESC
  `;
  try {
    const [prestamos] = await db.query(sql);
    res.status(200).json(prestamos);
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensaje: 'Error al obtener préstamos' });
  }
};