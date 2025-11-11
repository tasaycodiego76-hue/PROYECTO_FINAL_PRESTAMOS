const db = require('../config/db')

// Crear préstamo con interés
// Crear préstamo con interés
exports.crearPrestamo = async (req, res) => {
  const { clienteId, montoPrestado, fechaPrestamo } = req.body;

  if (!clienteId || !montoPrestado || !fechaPrestamo) {
    return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
  }

  try {
    // 🔍 Verificar si el cliente tiene préstamos pendientes
    const [pendientes] = await db.query(
      'SELECT * FROM prestamos WHERE clienteId = ? AND saldoPendiente > 0',
      [clienteId]
    );

    if (pendientes.length > 0) {
      return res.status(400).json({
        mensaje: 'El cliente aún tiene préstamos pendientes. No puede solicitar uno nuevo hasta pagarlos todos.',
      });
    }

    // Si no tiene deudas, se crea el préstamo
    const interes = 10; // 10%
    const saldoPendiente = montoPrestado + (montoPrestado * interes / 100);

    const sql = `
      INSERT INTO prestamos (clienteId, montoPrestado, saldoPendiente, fechaPrestamo)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [clienteId, montoPrestado, saldoPendiente, fechaPrestamo]);

    res.status(201).json({
      id: result.insertId,
      mensaje: `Préstamo registrado con ${interes}% de interés`,
      saldoPendiente,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensaje: 'Error al registrar préstamo' });
  }
};


// Actualizar préstamo
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
  try {
    const sql = `
      SELECT 
        p.*, 
        (SELECT nombre FROM clientes WHERE id = p.clienteId) AS cliente
      FROM prestamos p
      ORDER BY p.id DESC
    `
    const [prestamos] = await db.query(sql)
    res.status(200).json(prestamos)
  } catch (e) {
    console.error(e)
    res.status(500).json({ mensaje: 'Error al obtener los préstamos' })
  }
}
