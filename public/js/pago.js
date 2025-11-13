const API_PAGOS = 'http://localhost:3000/api/pagos';
const API_PRESTAMOS = 'http://localhost:3000/api/prestamos';

const formulario = document.getElementById('form-pago');
const tabla = document.getElementById('tabla-pagos');
const idpago = document.getElementById('idpago');
const selectPrestamo = document.getElementById('selectPrestamo');
const montoPago = document.getElementById('montoPago');
const fechaPago = document.getElementById('fechaPago');
const metodoPago = document.getElementById('metodoPago');
const pdfPago = document.getElementById('pdfPago');
const btnGuardar = document.getElementById('btnGuardar');
const btnCancelar = document.getElementById('btnCancelar');
const saldoPendiente = document.getElementById('saldoPendiente');

let prestamosGlobales = [];

saldoPendiente.readOnly = true;
saldoPendiente.style.backgroundColor = '#f0f0f0';
saldoPendiente.style.fontWeight = 'bold';

btnCancelar.addEventListener('click', () => {
  formulario.reset();
  idpago.value = '';
  saldoPendiente.value = '';
  btnGuardar.innerText = 'Guardar';
});

function calcularTotalConInteres(prestamo) {
  const monto = parseFloat(prestamo.montoPrestado) || 0;

  // Si viene porcentaje (propiedad interesPorcentaje) úsalo
  if (prestamo.interesPorcentaje !== undefined && prestamo.interesPorcentaje !== null) {
    const pct = parseFloat(prestamo.interesPorcentaje) || 0;
    return monto + (monto * pct / 100);
  }

  // Si vienen intereses como monto absoluto
  const interesAbs = parseFloat(prestamo.interes) || 0;
  return monto + interesAbs;
}

async function cargarPrestamos() {
  try {
    const res = await fetch(API_PRESTAMOS);
    if (!res.ok) throw new Error('Error al cargar préstamos');
    prestamosGlobales = await res.json();

    selectPrestamo.innerHTML = '<option value="">Seleccione...</option>';

    prestamosGlobales.forEach(p => {
      const totalConInteres = calcularTotalConInteres(p);
      const saldoBackend = (p.saldoPendiente !== undefined && p.saldoPendiente !== null)
        ? parseFloat(p.saldoPendiente)
        : (totalConInteres - (parseFloat(p.montoPagadoTotal) || 0));

// Mostrar todos los préstamos, incluso de clientes inactivos
const opt = document.createElement('option');
opt.value = p.id;
opt.textContent = `${p.cliente}${p.estado === 'inactivo' ? ' (Inactivo)' : ''}`;
selectPrestamo.appendChild(opt);

    });
  } catch (err) {
    console.error('cargarPrestamos error:', err);
  }
}

async function obtenerPagosPorPrestamo(prestamoId) {
  try {
    const res = await fetch(API_PAGOS);
    if (!res.ok) return [];
    const pagos = await res.json();
    return pagos.filter(x => String(x.prestamoId) === String(prestamoId));
  } catch (err) {
    console.error('obtenerPagosPorPrestamo error:', err);
    return [];
  }
}

async function actualizarSaldoPendiente(prestamoId) {
  if (!prestamoId) {
    saldoPendiente.value = '';
    return;
  }

  const prestamo = prestamosGlobales.find(p => String(p.id) === String(prestamoId));
  if (!prestamo) {
    await cargarPrestamos();
    const p2 = prestamosGlobales.find(p => String(p.id) === String(prestamoId));
    if (!p2) {
      saldoPendiente.value = '';
      return;
    } else {
      return actualizarSaldoPendiente(prestamoId);
    }
  }

  const pagos = await obtenerPagosPorPrestamo(prestamoId);
  const totalPagado = pagos.reduce((acc, it) => acc + (parseFloat(it.montoPagado) || 0), 0);

  const totalConInteres = calcularTotalConInteres(prestamo);
  const saldoReal = totalConInteres - totalPagado;

  saldoPendiente.value = (saldoReal > 0 ? saldoReal : 0).toFixed(2);
}

selectPrestamo.addEventListener('change', () => {
  actualizarSaldoPendiente(selectPrestamo.value);
});

// Mostrar tabla de pagos CON ESTADO DEL CLIENTE
async function obtenerPagos() {
  try {
    const res = await fetch(API_PAGOS);
    if (!res.ok) throw new Error('Error al obtener pagos');
    const pagos = await res.json();

    tabla.innerHTML = '';
    pagos.forEach(p => {
      const row = tabla.insertRow();
      row.insertCell().textContent = p.id;
      
      // Cliente (sin badge)
      row.insertCell().textContent = p.cliente;

      // Estado en columna separada
      const estadoCell = row.insertCell();
      if (p.estadoCliente === 'activo') {
        estadoCell.innerHTML = '<span class="badge bg-success">Activo</span>';
      } else {
        estadoCell.innerHTML = '<span class="badge bg-secondary">Inactivo</span>';
        row.style.backgroundColor = '#f8f9fa';
      }

      const prestamoRelacionado = prestamosGlobales.find(pr => String(pr.id) === String(p.prestamoId));
      // Siempre calcula el interés directamente con los datos del pago
       let totalConInteres = calcularTotalConInteres(p);


      row.insertCell().textContent = totalConInteres.toFixed(2);
      row.insertCell().textContent = p.montoPagado;
      row.insertCell().textContent = (p.fechaPago || '').split('T')[0] || '';
      row.insertCell().textContent = p.metodoPago || '';

      const pdfCell = row.insertCell();
      if (p.pdfPago) {
        const a = document.createElement('a');
        a.href = `uploads/${p.pdfPago}`;
        a.target = '_blank';
        a.textContent = 'Ver PDF';
        pdfCell.appendChild(a);
      } else {
        pdfCell.textContent = '-';
      }
    });
  } catch (err) {
    console.error('obtenerPagos error:', err);
  }
}

formulario.addEventListener('submit', async (e) => {
  e.preventDefault();
  const prestamoId = selectPrestamo.value;
  if (!prestamoId) {
    Swal.fire({ title: 'Seleccione un cliente', icon: 'warning' });
    return;
  }

  const data = new FormData();
  data.append('prestamoId', prestamoId);
  data.append('montoPagado', montoPago.value);
  data.append('fechaPago', fechaPago.value);
  data.append('metodoPago', metodoPago.value);
  if (pdfPago.files[0]) data.append('pdfPago', pdfPago.files[0]);

  const id = idpago.value;
  const url = id ? `${API_PAGOS}/${id}` : API_PAGOS;
  const method = id ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, { method, body: data });
    if (!res.ok) {
      const txt = await res.text().catch(()=>null);
      throw new Error(txt || 'Error guardando pago');
    }

    await obtenerPagos();
    await cargarPrestamos();

    const prestamo = prestamosGlobales.find(p => String(p.id) === String(prestamoId));
    const pagos = await obtenerPagosPorPrestamo(prestamoId);
    const totalPagado = pagos.reduce((acc, it) => acc + (parseFloat(it.montoPagado) || 0), 0);
    const totalConInteres = calcularTotalConInteres(prestamo);
    const saldoReal = totalConInteres - totalPagado;

    if (saldoReal <= 0.001) {
      await Swal.fire({
        title: "¡Préstamo cancelado! Este cliente ya completó todos sus pagos",
        icon: "success",
        draggable: true
      });
      await cargarPrestamos();
      selectPrestamo.value = '';
      saldoPendiente.value = '';
    } else {
      await Swal.fire({
        title: "Pago registrado correctamente",
        icon: "success",
        timer: 1300,
        showConfirmButton: false
      });
      saldoPendiente.value = saldoReal.toFixed(2);
    }

    formulario.reset();
    idpago.value = '';
    btnGuardar.innerText = 'Guardar';
  } catch (err) {
    console.error('error submit pago:', err);
    Swal.fire({ title: 'Error al guardar pago', icon: 'error' });
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  await cargarPrestamos();
  await obtenerPagos();
});