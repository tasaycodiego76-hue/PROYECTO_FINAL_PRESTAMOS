const API_PAGOS = 'http://localhost:3000/api/pagos';
const API_PRESTAMOS = 'http://localhost:3000/api/prestamos';

const formulario = document.getElementById('form-pago');
const tabla = document.getElementById('tabla-pagos');
const idpago = document.getElementById('idpago');
const selectPrestamo = document.getElementById('selectPrestamo');
const montoPago = document.getElementById('montoPago');
const fechaPago = document.getElementById('fechaPago');
const metodoPago = document.getElementById('metodoPago');
const btnGuardar = document.getElementById('btnGuardar');
const btnCancelar = document.getElementById('btnCancelar');

btnCancelar.addEventListener('click', () => {
  formulario.reset();
  idpago.value = '';
  btnGuardar.innerText = 'Guardar';
});

// Cargar préstamos en el select
async function cargarPrestamos() {
  const res = await fetch(API_PRESTAMOS);
  const prestamos = await res.json();
  selectPrestamo.innerHTML = '<option value="">Seleccione Prestamo</option>';
  prestamos.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.id} - ${p.cliente} - Saldo: ${p.saldoPendiente}`;
    selectPrestamo.appendChild(opt);
  });
}

// Obtener y renderizar pagos
async function obtenerPagos() {
  const res = await fetch(API_PAGOS);
  const pagos = await res.json();
  tabla.innerHTML = '';

  pagos.forEach(p => {
    const row = tabla.insertRow();
    row.insertCell().textContent = p.id;
    row.insertCell().textContent = p.cliente;
    row.insertCell().textContent = p.montoPrestado;
    row.insertCell().textContent = p.montoPagado;
    row.insertCell().textContent = p.fechaPago.split('T')[0];
    row.insertCell().textContent = p.metodoPago;

    const actions = row.insertCell();

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Editar';
    editBtn.classList.add('btn', 'btn-info', 'btn-sm');
    editBtn.onclick = () => cargarParaEdicion(p);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.classList.add('btn', 'btn-danger', 'btn-sm');
    deleteBtn.onclick = () => eliminarPago(p.id, p.cliente);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);
  });
}

function cargarParaEdicion(p) {
  idpago.value = p.id;
  selectPrestamo.value = p.prestamoId;
  montoPago.value = p.montoPagado;
  fechaPago.value = p.fechaPago.split('T')[0];
  metodoPago.value = p.metodoPago;
  btnGuardar.innerText = 'Actualizar';
}

async function eliminarPago(id, cliente) {
  if (confirm(`¿Seguro que desea eliminar el pago de ${cliente}?`)) {
    await fetch(`${API_PAGOS}/${id}`, { method: 'DELETE' });
    obtenerPagos();
    cargarPrestamos();
  }
}

formulario.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    prestamoId: selectPrestamo.value,
    montoPagado: parseFloat(montoPago.value),
    fechaPago: fechaPago.value,
    metodoPago: metodoPago.value
  };

  const id = idpago.value;
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_PAGOS}/${id}` : API_PAGOS;

  await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  formulario.reset();
  idpago.value = '';
  btnGuardar.innerText = 'Guardar';
  cargarPrestamos();
  obtenerPagos();
});

document.addEventListener('DOMContentLoaded', () => {
  cargarPrestamos();
  obtenerPagos();
});