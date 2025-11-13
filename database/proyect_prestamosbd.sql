CREATE DATABASE prestamopymes;
USE prestamopymes;

CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(9),
    estado VARCHAR(20) DEFAULT 'activo'
);

CREATE TABLE prestamos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clienteId INT NOT NULL,
    montoPrestado DECIMAL(10,2) NOT NULL,
    interesPorcentaje DECIMAL(5,2) NOT NULL DEFAULT 0,
    saldoPendiente DECIMAL(10,2) NOT NULL DEFAULT 0,
    fechaPrestamo DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo',
    FOREIGN KEY (clienteId) REFERENCES clientes(id)
);

CREATE TABLE pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prestamoId INT NOT NULL,
    montoPrestamo DECIMAL(10,2) DEFAULT 0,
    interes DECIMAL(5,2) DEFAULT 0,
    totalAmortizado DECIMAL(10,2) DEFAULT 0,
    saldoAnterior DECIMAL(10,2) DEFAULT 0,
    montoPagado DECIMAL(10,2) NOT NULL,
    saldoRestante DECIMAL(10,2) DEFAULT 0,
    fechaPago DATE NOT NULL,
    metodoPago VARCHAR(50) NOT NULL,
    pdfPago VARCHAR(255) NULL,
    FOREIGN KEY (prestamoId) REFERENCES prestamos(id)
);

INSERT INTO clientes (nombre, email, telefono) VALUES
('Ana García', 'ana.garcia@email.com', '987654321'),
('Luis Pérez', 'luis.perez@email.com', '976253421'),
('Marta Soto', 'marta.soto@email.com', '987265142');

INSERT INTO prestamos (clienteId, montoPrestado, interesPorcentaje, saldoPendiente, fechaPrestamo) VALUES
(1, 5000.00, 10.00, 5500.00, '2025-01-10'), 
(2, 12000.00, 15.00, 13800.00, '2025-02-01'), 
(3, 3000.00, 8.00, 3240.00, '2025-03-05');  

INSERT INTO pagos (prestamoId, montoPrestamo, interes, totalAmortizado, saldoAnterior, montoPagado, saldoRestante, fechaPago, metodoPago) VALUES
(1, 5000.00, 10.00, 5500.00, 5500.00, 1000.00, 4500.00, '2025-02-10', 'Efectivo'),
(1, 5000.00, 10.00, 5500.00, 4500.00, 1200.00, 3300.00, '2025-03-10', 'Yape');


      SELECT 
        pa.*, 
        c.nombre AS cliente,
        c.estado AS estadoCliente,
        pr.montoPrestado,
        pr.interesPorcentaje
      FROM pagos pa
      INNER JOIN prestamos pr ON pa.prestamoId = pr.id
      INNER JOIN clientes c ON pr.clienteId = c.id
      ORDER BY pa.id DESC