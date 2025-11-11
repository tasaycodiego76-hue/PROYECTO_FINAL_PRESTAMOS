const API_PRESTAMOS = 'http://localhost:3000/api/prestamos'
const API_CLIENTES = 'http://localhost:3000/api/clientes'

const formulario = document.getElementById('form-prestamo')
const tabla = document.querySelector('#tabla-prestamos')
const idprestamo = document.getElementById('idprestamo')
const selectCliente = document.getElementById('selectCliente')
const montoPrestado = document.getElementById('montoPrestado')
const fechaPrestamo = document.getElementById('fechaPrestamo')
const btnGuardar = document.getElementById('btnGuardar')
const btnCancelar = document.getElementById('btnCancelar')
const btnHistorial = document.getElementById('btnHistorial')

// Restablecer botón y formulario
btnCancelar.addEventListener('click', () => {
  formulario.reset()
  idprestamo.value = ''
  btnGuardar.innerText = 'Registrar'
})

// Mostrar historial de préstamos del cliente
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

    // Filtra solo los préstamos del cliente
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
      const item = `
        <div class="mb-2 p-2 border-bottom">
          <strong>💰 Monto:</strong> S/ ${p.montoPrestado}<br>
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


// Cargar lista de clientes
async function cargarClientes() {
  try {
    const res = await fetch(API_CLIENTES)
    const clientes = await res.json()
    selectCliente.innerHTML = '<option value="">Seleccione Cliente</option>'
    clientes.forEach(c => {
      const opt = document.createElement('option')
      opt.value = c.id
      opt.textContent = c.nombre
      selectCliente.appendChild(opt)
    })
  } catch (e) {
    console.error('Error al cargar clientes:', e)
  }
}

// Obtener préstamos
async function obtenerPrestamos() {
  const response = await fetch(API_PRESTAMOS)
  const prestamos = await response.json()

  tabla.innerHTML = ''
  prestamos.forEach(p => {
    const row = tabla.insertRow()
    row.insertCell().textContent = p.id
    row.insertCell().textContent = p.cliente || p.nombre || ''
    row.insertCell().textContent = p.montoPrestado
    row.insertCell().textContent = p.saldoPendiente
    row.insertCell().textContent = p.fechaPrestamo ? p.fechaPrestamo.split('T')[0] : ''

    const actionCell = row.insertCell()

    const editButton = document.createElement('button')
    editButton.textContent = 'Editar'
    editButton.classList.add('btn', 'btn-info', 'btn-sm', 'me-1')
    editButton.onclick = () => cargarParaEdicion(p)

    const deleteButton = document.createElement('button')
    deleteButton.textContent = 'Eliminar'
    deleteButton.classList.add('btn', 'btn-danger', 'btn-sm')
    deleteButton.onclick = () => eliminarPrestamo(p.id, p.cliente)

    actionCell.appendChild(editButton)
    actionCell.appendChild(deleteButton)
  })
}

// Cargar para edición
function cargarParaEdicion(p) {
  idprestamo.value = p.id
  selectCliente.value = p.clienteId
  montoPrestado.value = p.montoPrestado
  fechaPrestamo.value = p.fechaPrestamo.split('T')[0]
  btnGuardar.innerText = 'Actualizar'
}

// Eliminar préstamo
async function eliminarPrestamo(id, cliente) {
  if (confirm(`¿Seguro de eliminar préstamo del cliente: ${cliente}?`)) {
    await fetch(`${API_PRESTAMOS}/${id}`, { method: 'DELETE' })
    obtenerPrestamos()
  }
}

// Registrar o actualizar préstamo
formulario.addEventListener('submit', async (event) => {
  event.preventDefault();

  const data = {
    clienteId: selectCliente.value,
    montoPrestado: parseFloat(montoPrestado.value),
    saldoPendiente: parseFloat(montoPrestado.value),
    fechaPrestamo: fechaPrestamo.value
  };

  try {
    let response;
    if (idprestamo.value === '') {
      // Crear nuevo préstamo
      response = await fetch(API_PRESTAMOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } else {
      // Actualizar préstamo existente
      response = await fetch(`${API_PRESTAMOS}/${idprestamo.value}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }

    const dataRes = await response.json();

    if (!response.ok) {
      // Error -> SweetAlert2 (advertencia)
      Swal.fire({
        icon: 'error',
        title: 'No permitido',
        text: dataRes.mensaje || 'No se puede registrar el préstamo. Verifique.',
        confirmButtonColor: '#d33'
      });
      return;
    }

    // Éxito -> SweetAlert2 (breve y automático)
    Swal.fire({
      icon: 'success',
      title: '¡Listo!',
      text: 'Préstamo registrado correctamente',
      timer: 1400,
      showConfirmButton: false
    });

    // Limpieza y recarga
    formulario.reset();
    btnGuardar.innerText = 'Registrar';
    obtenerPrestamos();

  } catch (error) {
    console.error(error);
    // Error de conexión u otro -> SweetAlert2
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo conectar con el servidor.',
      footer: 'Revisa que el servidor esté en funcionamiento'
    });
  }
});


// Cargar al iniciar
document.addEventListener('DOMContentLoaded', () => {
  cargarClientes()
  obtenerPrestamos()
})