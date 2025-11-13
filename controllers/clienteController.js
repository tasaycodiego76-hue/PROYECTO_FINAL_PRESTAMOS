const db = require('../config/db')

// Crear cliente
exports.crearCliente = async (req, res) => {
  const { nombre, email, telefono } = req.body

  if (!nombre) {
    return res.status(400).json({ mensaje: 'El nombre es obligatorio' })
  }

  try {
    // Verificar si ya existe un cliente con el mismo nombre (activo o inactivo)
    const [existente] = await db.query(
      'SELECT * FROM clientes WHERE nombre = ?',
      [nombre]
    )

    if (existente.length > 0) {
      const clienteExistente = existente[0]
      
      if (clienteExistente.estado === 'inactivo') {
        return res.status(400).json({
          mensaje: `Ya existe un cliente con el nombre "${nombre}" que está inactivo. ¿Deseas reactivarlo?`,
          clienteInactivo: true,
          clienteId: clienteExistente.id
        })
      } else {
        return res.status(400).json({
          mensaje: `Ya existe un cliente activo con el nombre "${nombre}"`
        })
      }
    }

    const sql = "INSERT INTO clientes (nombre, email, telefono, estado) VALUES (?,?,?,'activo')"
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

// Actualizar Cliente
exports.actualizarCliente = async (req, res) => {
  const { id } = req.params
  const { nombre, email, telefono } = req.body
  
  try {
    // Verificar que no exista otro cliente con el mismo nombre
    const [existente] = await db.query(
      'SELECT * FROM clientes WHERE nombre = ? AND id != ?',
      [nombre, id]
    )

    if (existente.length > 0) {
      return res.status(400).json({
        mensaje: 'Ya existe otro cliente con ese nombre'
      })
    }

    const sql = 'UPDATE clientes SET nombre = ?, email = ?, telefono = ? WHERE id = ?'
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

// Listar clientes - SOLO ACTIVOS
exports.obtenerClientes = async (req, res) => {
  try {
    const [clientes] = await db.query(
      "SELECT * FROM clientes WHERE estado = 'activo' ORDER BY id DESC"
    )
    res.status(200).json(clientes)
  } catch (e) {
    console.error(e)
    res.status(500).json({ mensaje: 'Error al obtener los clientes' })
  }
}

// Listar clientes INACTIVOS
exports.obtenerClientesInactivos = async (req, res) => {
  try {
    const [clientes] = await db.query(
      "SELECT * FROM clientes WHERE estado = 'inactivo' ORDER BY id DESC"
    )
    res.status(200).json(clientes)
  } catch (e) {
    console.error(e)
    res.status(500).json({ mensaje: 'Error al obtener clientes inactivos' })
  }
}

// Desactivar cliente (SOFT DELETE)
exports.eliminarCliente = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      "UPDATE clientes SET estado = 'inactivo' WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    await db.query(
      "UPDATE prestamos SET estado = 'inactivo' WHERE clienteId = ?",
      [id]
    );

    res.status(200).json({ 
      mensaje: 'Cliente desactivado correctamente' 
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensaje: 'Error al desactivar cliente' });
  }
}

// Reactivar cliente
exports.reactivarCliente = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query(
      "UPDATE clientes SET estado = 'activo' WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    await db.query(
      "UPDATE prestamos SET estado = 'activo' WHERE clienteId = ?",
      [id]
    );

    res.status(200).json({ 
      mensaje: 'Cliente reactivado correctamente' 
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensaje: 'Error al reactivar cliente' });
  }
};