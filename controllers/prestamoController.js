const db = require('../config/db');

// Crear préstamo
exports.crearPrestamo = async (req, res) => {
  const { clienteId, montoPrestado, interesPorcentaje, saldoPendiente, fechaPrestamo } = req.body;

  if (!clienteId || !montoPrestado || !fechaPrestamo) {
    return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
  }

  try {
    // Verificar si tiene préstamos pendientes
    const [pendientes] = await db.query(
      'SELECT * FROM prestamos WHERE clienteId = ? AND saldoPendiente > 0',
      [clienteId]
    );

    if (pendientes.length > 0) {
      return res.status(400).json({
        mensaje: 'El cliente tiene préstamos pendientes. Debe pagarlos antes de solicitar uno nuevo.',
      });
    }

    const sql = `INSERT INTO prestamos (clienteId, montoPrestado, interesPorcentaje, saldoPendiente, fechaPrestamo) 
                 VALUES (?, ?, ?, ?, ?)`;
    
    const [result] = await db.query(sql, [
      clienteId, 
      montoPrestado, 
      interesPorcentaje || 0, 
      saldoPendiente, 
      fechaPrestamo
    ]);

    res.status(201).json({
      id: result.insertId,
      mensaje: 'Préstamo registrado correctamente',
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensaje: 'Error al registrar préstamo' });
  }
};

// Actualizar préstamo
exports.actualizarPrestamo = async (req, res) => {
  const { id } = req.params;
  const { clienteId, montoPrestado, interesPorcentaje, saldoPendiente, fechaPrestamo } = req.body;
  
  const sql = `UPDATE prestamos 
               SET clienteId = ?, montoPrestado = ?, interesPorcentaje = ?, saldoPendiente = ?, fechaPrestamo = ? 
               WHERE id = ?`;
  
  try {
    const [result] = await db.query(sql, [clienteId, montoPrestado, interesPorcentaje, saldoPendiente, fechaPrestamo, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Préstamo no encontrado' });
    }
    res.status(200).json({ mensaje: 'Préstamo actualizado correctamente' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensaje: 'Error al actualizar préstamo' });
  }
};

// Listar préstamos
exports.obtenerPrestamos = async (req, res) => {
  try {
    const sql = `SELECT p.*, c.nombre AS cliente 
                 FROM prestamos p 
                 LEFT JOIN clientes c ON p.clienteId = c.id
                 ORDER BY p.id DESC`;
    const [prestamos] = await db.query(sql);
    res.status(200).json(prestamos);
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensaje: 'Error al obtener los préstamos' });
  }
};

// Eliminar préstamo
exports.eliminarPrestamo = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM prestamos WHERE id = ?', [id]);
    res.status(200).json({ mensaje: 'Préstamo eliminado' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensaje: 'Error al eliminar préstamo' });
  }
};