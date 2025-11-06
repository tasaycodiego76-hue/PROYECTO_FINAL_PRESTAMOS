const db = require('../config/db')

// Crear cliente
exports.crearCliente = async (req, res) => {
  const { nombre, email, telefono } = req.body

  if (!nombre) {
    return res.status(400).json({ mensaje: 'El nombre es obligatorio' })
  }

  const sql = "INSERT INTO clientes (nombre, email, telefono) VALUES (?,?,?)"

  try {
    const [result] = await db.query(sql, [nombre, email, telefono])
    res.status(201).json({
      id: result.insertId,
      mensaje: 'Cliente registrado correctamente'
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ mensaje: 'Error al registrar cliente' })
  }
}

//Actualziar Cliente
exports.actualizarCliente = async (req, res) => {
  const { id } = req.params
  const { nombre, email, telefono } = req.body
  
  const sql = 'UPDATE clientes SET nombre = ?, email = ?, telefono = ? WHERE id = ?'
  
  try {
    const [result] = await db.query(sql, [nombre, email, telefono, id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' })
    }
    res.status(200).json({ mensaje: 'Cliente actualizado correctamente' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ mensaje: 'Error al actualizar cliente' })
  }
}

// Listar clientes
exports.obtenerClientes = async (req, res) => {
  try {
    const [clientes] = await db.query('SELECT * FROM clientes ORDER BY id DESC')
    res.status(200).json(clientes)
  } catch (e) {
    console.error(e)
    res.status(500).json({ mensaje: 'Error al obtener los clientes' })
  }
}

// Eliminar cliente
exports.eliminarCliente = async (req, res) => {
  const { id } = req.params
  const sql = 'DELETE FROM clientes WHERE id = ?'

  try {
    const [result] = await db.query(sql, [id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' })
    }
    res.status(200).json({ mensaje: 'Cliente eliminado correctamente' })
  } catch (e) {
    console.error(e)
    res.status(500).json({ mensaje: 'Error al eliminar cliente' })
  }
}
