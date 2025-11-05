const API_PAGOS = 'http://localhost:3000/api/pagos';
const API_PRESTAMOS = 'http://localhost:3000/api/prestamos';

const form = document.getElementById('form-pago');
const tabla = document.getElementById('tabla-pagos');
const idpago = document.getElementById('idpago');
const selectPrestamo = document.getElementById('selectPrestamo');
const montoPago = document.getElementById('montoPago');
const fechaPago = document.getElementById('fechaPago');
const metodoPago = document.getElementById('metodoPago');
const comprobante = document.getElementById('comprobante');
const btnGuardar = document.getElementById('btnGuardar');
const btnCancelar = document.getElementById('btnCancelar');

btnCancelar.addEventListener('click', () => {
  form.reset();
  idpago.value = '';
  btnGuardar.innerText = 'Guardar';
});

// cargar préstamos en el select (muestra id - cliente - saldo)
async function cargarPrestamosSelect() {
  try {
    const res = await fetch(API_PRESTAMOS);
    const prestamos = await res.json();
    selectPrestamo.innerHTML = '<option value="">Seleccione Prestamo</option>';
    prestamos.forEach(p => {
      // p.cliente puede venir del JOIN en backend
      const text = `${p.id} - ${p.cliente || p.nombre || ''} - Saldo: ${parseFloat(p.saldoPendiente).toFixed(2)}`;
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = text;
      selectPrestamo.appendChild(opt);
    });
  } catch (err) {
    console.error('Error cargando prestamos:', err);
  }
}

async function obtenerPagos() {
  try {
    const res = await fetch(API_PAGOS);
    const pagos = await res.json();
    tabla.innerHTML = '';
    pagos.forEach(p => {
      const row = tabla.insertRow();
      row.insertCell().textContent = p.id;
      row.insertCell().textContent = p.cliente || p.nombre || '';
      row.insertCell().textContent = parseFloat(p.montoPrestado || 0).toFixed(2);
      row.insertCell().textContent = parseFloat(p.montoPagado || p.montoPagado).toFixed(2);
      row.insertCell().textContent = p.fechaPago ? p.fechaPago.split('T')[0] : (p.fecha || '');
      row.insertCell().textContent = p.metodoPago || '';
      const acciones = row.insertCell();
      const btnEditar = document.createElement('button');
      btnEditar.textContent = 'Editar';
      btnEditar.className = 'btn btn-info btn-sm me-1';
      btnEditar.onclick = () => cargarParaEdicion(p);
      const btnEliminar = document.createElement('button');
      btnEliminar.textContent = 'Eliminar';
      btnEliminar.className = 'btn btn-danger btn-sm';
      btnEliminar.onclick = () => eliminarPago(p.id);
      acciones.appendChild(btnEditar);
      acciones.appendChild(btnEliminar);
    });
  } catch (err) {
    console.error('Error al obtener pagos:', err);
  }
}

function cargarParaEdicion(p) {
  idpago.value = p.id;
  selectPrestamo.value = p.prestamoId || p.id_prestamo || '';
  montoPago.value = p.montoPagado || p.monto || '';
  fechaPago.value = p.fechaPago ? p.fechaPago.split('T')[0] : (p.fecha || '');
  metodoPago.value = p.metodoPago || '';
  btnGuardar.innerText = 'Actualizar';
}

async function eliminarPago(id) {
  if (!confirm('¿Seguro que desea eliminar este pago?')) return;
  try {
    await fetch(`${API_PAGOS}/${id}`, { method: 'DELETE' });
    obtenerPagos();
  } catch (err) {
    console.error('Error al eliminar pago:', err);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    prestamoId: selectPrestamo.value,
    montoPagado: parseFloat(montoPago.value) || 0,
    fechaPago: fechaPago.value,
    metodoPago: metodoPago.value
  };

  const id = idpago.value;
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_PAGOS}/${id}` : API_PAGOS;

  try {
    // Nota: cargamos comprobante pero lo guardamos local (si necesitas enviarlo al backend,
    // deberás implementar endpoint con multipart/form-data y usar FormData).
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    form.reset();
    idpago.value = '';
    btnGuardar.innerText = 'Guardar';
    // recargar listado y select (porque el pago actualiza saldo en préstamo)
    cargarPrestamosSelect();
    obtenerPagos();
  } catch (err) {
    console.error('Error al guardar pago:', err);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  cargarPrestamosSelect();
  obtenerPagos();
});
