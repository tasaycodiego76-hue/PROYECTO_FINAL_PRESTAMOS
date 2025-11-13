# Procedimientos

1. 👝 Clonar repositorio
git clone https://github.com/edwleo/electroperu.git

2. ⛏️ Restaurar la BD
```sql
-- Tabla de clientes
CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    estado VARCHAR(20) DEFAULT 'activo'
);

-- Tabla de préstamos
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

-- Tabla de pagos
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


```

3. 📋 Abrir proyecto _electroperu_ en VSCode

4. Abrir la terminal **CTRL + Ñ** escribir:
```
npm install
```
Se ejecutará la instalación de todas las dependecias definidas en **package.json**

5. Crear e ingresar los parámetros en el archivo **.env**

6. Ejecutar el servidor (_nodemon_)
```
nodemon server
```

7. 
```
prestamos-api/
├── config/
│   └── db.js
├── controllers/
│   ├── clienteController.js
│   ├── prestamoController.js
│   └── pagoController.js
├── routes/
│   ├── clienteRoutes.js
│   ├── prestamoRoutes.js
│   └── pagoRoutes.js
├── public/
│   ├── index.html
│   ├── prestamos.html
│   ├── pagos.html
│   ├── js/
│   │   ├── cliente.js
│   │   ├── prestamo.js
│   │   └── pago.js
│   └── uploads/            # carpeta pública para PDFs (se sirve por express)
├── .env
├── package.json
├── server.js
└── README.md
