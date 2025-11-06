const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Carpeta donde se guardarán los PDFs
const uploadsDir = path.join(__dirname, '../uploads');

// Crear carpeta si no existe
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// Registrar pago con PDF
exports.crearPago = [
  upload.single('pdfPago'), // acepta PDF
  async (req, res) => {
    const { prestamoId, montoPagado, fechaPago, metodoPago } = req.body;
    const pdfPago = req.file ? req.file.filename : null;

    if (!prestamoId || !montoPagado || !fechaPago || !metodoPago) {
      return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
    }

    try {
      const sqlPago = "INSERT INTO pagos (prestamoId, montoPagado, fechaPago, metodoPago, pdfPago) VALUES (?,?,?,?,?)";
      await db.query(sqlPago, [prestamoId, montoPagado, fechaPago, metodoPago, pdfPago]);

      const sqlUpdate = 'UPDATE prestamos SET saldoPendiente = saldoPendiente - ? WHERE id = ?';
      await db.query(sqlUpdate, [montoPagado, prestamoId]);

      res.status(201).json({ mensaje: 'Pago registrado correctamente' });
    } catch (e) {
      console.error(e);
      res.status(500).json({ mensaje: 'Error al registrar pago' });
    }
  }
];

// Listar pagos con PDF
exports.obtenerPagos = async (req, res) => {
  try {
    const sql = `
      SELECT 
        pa.*, 
        (SELECT nombre FROM clientes WHERE id = (SELECT clienteId FROM prestamos WHERE id = pa.prestamoId)) AS cliente,
        (SELECT montoPrestado FROM prestamos WHERE id = pa.prestamoId) AS montoPrestado
      FROM pagos pa
      ORDER BY pa.id DESC
    `;
    const [pagos] = await db.query(sql);
    res.status(200).json(pagos);
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensaje: 'Error al obtener los pagos' });
  }
};
