const API_PRESTAMOS = 'http://localhost:3000/api/prestamos';
const API_CLIENTES = 'http://localhost:3000/api/clientes';

const formulario = document.getElementById('form-prestamo');
const tabla = document.querySelector('#tabla-prestamos');
const idprestamo = document.getElementById('idprestamo');
const selectCliente = document.getElementById('selectCliente');
const montoPrestado = document.getElementById('montoPrestado');
const interesPorcentaje = document.getElementById('interesPorcentaje');
const fechaPrestamo = document.getElementById('fechaPrestamo');
const btnGuardar = document.getElementById('btnGuardar');
const btnCancelar = document.getElementById('btnCancelar');
const btnHistorial = document.getElementById('btnHistorial');

// Elementos de cálculo previo
const calculoPrevio = document.getElementById('calculoPrevio');
const calcMonto = document.getElementById('calcMonto');
const calcInteresPct = document.getElementById('calcInteresPct');
const calcInteresValor = document.getElementById('calcInteresValor');
const calcTotal = document.getElementById('calcTotal');

// Calcular total cuando cambian los valores
montoPrestado.addEventListener('input', calcularTotal);
interesPorcentaje.addEventListener('input', calcularTotal);

function calcularTotal() {
  const monto = parseFloat(montoPrestado.value) || 0;
  const interes = parseFloat(interesPorcentaje.value) || 0;
  const interesValor = (monto * interes) / 100;
  const total = monto + interesValor;

  if (monto > 0) {
    calculoPrevio.style.display = 'block';
    calcMonto.textContent = monto.toFixed(2);
    calcInteresPct.textContent = interes.toFixed(2);
    calcInteresValor.textContent = interesValor.toFixed(2);
    calcTotal.textContent = total.toFixed(2);
  } else {
    calculoPrevio.style.display = 'none';
  }
}

// Restablecer formulario
btnCancelar.addEventListener('click', () => {
  formulario.reset();
  idprestamo.value = '';
  btnGuardar.innerText = 'Registrar';
  calculoPrevio.style.display = 'none';
  interesPorcentaje.value = '10';
});

// Ver historial del cliente
btnHistorial.addEventListener('click', async () => {
  const clienteId = selectCliente.value;
  const historialContainer = document.getElementById('historial-container');
  const historialContent = document.getElementById('historial-content');

  if (!clienteId) {
    Swal.fire({
      icon: "warning",
      title: "Seleccione un cliente primero",
      showConfirmButton: false,
      timer: 1500
    });
    return;
  }

  try {
    const response = await fetch(API_PRESTAMOS);
    const prestamos = await response.json();
    const historial = prestamos.filter(p => p.clienteId === parseInt(clienteId));

    historialContent.innerHTML = "";
    historialContainer.style.display = "block";

    if (historial.length === 0) {
      historialContent.innerHTML = `<p class="text-muted">Este cliente no tiene préstamos registrados.</p>`;
      return;
    }

    historial.forEach(p => {
      const fecha = p.fechaPrestamo ? p.fechaPrestamo.split('T')[0] : 'Sin fecha';
      const estado = p.saldoPendiente > 0 ? '🟠 Pendiente' : '🟢 Pagado';
      const totalAPagar = parseFloat(p.montoPrestado) + (parseFloat(p.montoPrestado) * parseFloat(p.interesPorcentaje) / 100);
      
      const item = `
        <div class="mb-2 p-2 border-bottom">
          <strong>💰 Monto:</strong> S/ ${p.montoPrestado} + ${p.interesPorcentaje}% = S/ ${totalAPagar.toFixed(2)}<br>
          <strong>📅 Fecha:</strong> ${fecha}<br>
          <strong>💵 Saldo:</strong> S/ ${p.saldoPendiente}<br>
          <strong>📌 Estado:</strong> ${estado}
        </div>
      `;
      historialContent.innerHTML += item;
    });
  } catch (e) {
    console.error("Error al cargar historial:", e);
  }
});

// Cargar clientes
async function cargarClientes() {
  try {
    const res = await fetch(API_CLIENTES);
    const clientes = await res.json();
    selectCliente.innerHTML = '<option value="">Seleccione Cliente</option>';
    clientes.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.nombre;
      selectCliente.appendChild(opt);
    });
  } catch (e) {
    console.error('Error al cargar clientes:', e);
  }
}

// Obtener préstamos
async function obtenerPrestamos() {
  const response = await fetch(API_PRESTAMOS);
  const prestamos = await response.json();

  tabla.innerHTML = '';
  prestamos.forEach(p => {
    const row = tabla.insertRow();
    row.insertCell().textContent = p.id;
    row.insertCell().textContent = p.cliente || '';
    row.insertCell().textContent = `S/ ${parseFloat(p.montoPrestado).toFixed(2)}`;
    row.insertCell().textContent = `${parseFloat(p.interesPorcentaje).toFixed(2)}%`;
    
    // Total a pagar
    const totalAPagar = parseFloat(p.montoPrestado) + (parseFloat(p.montoPrestado) * parseFloat(p.interesPorcentaje) / 100);
    row.insertCell().textContent = `S/ ${totalAPagar.toFixed(2)}`;
    
    row.insertCell().textContent = `S/ ${parseFloat(p.saldoPendiente).toFixed(2)}`;
    row.insertCell().textContent = p.fechaPrestamo ? p.fechaPrestamo.split('T')[0] : '';

    const actionCell = row.insertCell();
    const editButton = document.createElement('button');
    editButton.textContent = 'Editar';
    editButton.classList.add('btn', 'btn-info', 'btn-sm', 'me-1');
    editButton.onclick = () => cargarParaEdicion(p);

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Eliminar';
    deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
    deleteButton.onclick = () => eliminarPrestamo(p.id, p.cliente);

    actionCell.appendChild(editButton);
    actionCell.appendChild(deleteButton);
  });
}

// Cargar para edición
function cargarParaEdicion(p) {
  idprestamo.value = p.id;
  selectCliente.value = p.clienteId;
  montoPrestado.value = p.montoPrestado;
  interesPorcentaje.value = p.interesPorcentaje;
  fechaPrestamo.value = p.fechaPrestamo.split('T')[0];
  btnGuardar.innerText = 'Actualizar';
  calcularTotal();
}

// Eliminar préstamo
async function eliminarPrestamo(id, cliente) {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: `Se eliminará el préstamo de ${cliente}`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    await fetch(`${API_PRESTAMOS}/${id}`, { method: 'DELETE' });
    Swal.fire('Eliminado', 'Préstamo eliminado correctamente', 'success');
    obtenerPrestamos();
  }
}

// Registrar o actualizar préstamo
formulario.addEventListener('submit', async (event) => {
  event.preventDefault();

  const monto = parseFloat(montoPrestado.value);
  const interes = parseFloat(interesPorcentaje.value);
  const saldoPendiente = monto + (monto * interes / 100);

  const data = {
    clienteId: selectCliente.value,
    montoPrestado: monto,
    interesPorcentaje: interes,
    saldoPendiente: saldoPendiente,
    fechaPrestamo: fechaPrestamo.value
  };

  try {
    let response;
    if (idprestamo.value === '') {
      response = await fetch(API_PRESTAMOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      response = await fetch(`${API_PRESTAMOS}/${idprestamo.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }

    const dataRes = await response.json();

    if (!response.ok) {
      Swal.fire({
        icon: 'error',
        title: 'No permitido',
        text: dataRes.mensaje || 'No se puede registrar el préstamo.',
        confirmButtonColor: '#d33'
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: '¡Listo!',
      text: 'Préstamo registrado correctamente',
      timer: 1400,
      showConfirmButton: false
    });

    formulario.reset();
    idprestamo.value = '';
    btnGuardar.innerText = 'Registrar';
    calculoPrevio.style.display = 'none';
    interesPorcentaje.value = '10';
    obtenerPrestamos();

  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo conectar con el servidor.'
    });
  }
});

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  cargarClientes();
  obtenerPrestamos();
  fechaPrestamo.value = new Date().toISOString().split('T')[0];
});