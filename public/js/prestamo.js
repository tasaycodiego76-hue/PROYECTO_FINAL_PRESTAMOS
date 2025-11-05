// endpoints
const API_PRESTAMOS = 'http://localhost:3000/api/prestamos';
const API_CLIENTES = 'http://localhost:3000/api/clientes';

const form = document.getElementById('form-prestamo');
const tabla = document.getElementById('tabla-prestamos');
const idprestamo = document.getElementById('idprestamo');
const selectCliente = document.getElementById('selectCliente');
const montoPrestado = document.getElementById('montoPrestado');
const fechaPrestamo = document.getElementById('fechaPrestamo');
const btnGuardar = document.getElementById('btnGuardar');
const btnCancelar = document.getElementById('btnCancelar');
const btnBuscarDNI = document.getElementById('btnBuscarDNI');
const btnLetraPDF = document.getElementById('btnLetraPDF');

btnCancelar.addEventListener('click', () => {
  form.reset();
  idprestamo.value = '';
  btnGuardar.innerText = 'Registrar';
});

btnBuscarDNI.addEventListener('click', () => {
  const dni = prompt('Ingrese DNI para buscar cliente:');
  if (!dni) return;
  buscarClientePorDNI(dni);
});

btnLetraPDF.addEventListener('click', () => {
  alert('Generar PDF de letra (función placeholder).');
  // Aquí podrías abrir endpoint que genere PDF si lo implementas en backend
});

// cargar clientes para el select y prestamos en la tabla
async function cargarClientesSelect() {
  try {
    const res = await fetch(API_CLIENTES);
    const clientes = await res.json();
    selectCliente.innerHTML = '<option value="">Seleccione Cliente</option>';
    clientes.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.nombre; // tu tabla clientes tiene "nombre"
      selectCliente.appendChild(opt);
    });
  } catch (err) {
    console.error('Error cargando clientes:', err);
  }
}

async function obtenerPrestamos() {
  try {
    const res = await fetch(API_PRESTAMOS);
    const prestamos = await res.json();
    tabla.innerHTML = '';
    prestamos.forEach(p => {
      const row = tabla.insertRow();
      row.insertCell().textContent = p.id;
      row.insertCell().textContent = p.cliente || p.nombre || ''; // si tu backend envía cliente
      row.insertCell().textContent = parseFloat(p.montoPrestado).toFixed(2);
      row.insertCell().textContent = parseFloat(p.saldoPendiente).toFixed(2);
      // fechaPrestamo puede venir en formato YYYY-MM-DD; mostramos como está
      row.insertCell().textContent = p.fechaPrestamo ? p.fechaPrestamo.split('T')[0] : (p.fecha || '');
      const actions = row.insertCell();
      const btnEdit = document.createElement('button');
      btnEdit.textContent = 'Editar';
      btnEdit.className = 'btn btn-info btn-sm me-1';
      btnEdit.onclick = () => cargarParaEdicion(p);
      const btnDelete = document.createElement('button');
      btnDelete.textContent = 'Eliminar';
      btnDelete.className = 'btn btn-danger btn-sm';
      btnDelete.onclick = () => eliminarPrestamo(p.id);
      actions.appendChild(btnEdit);
      actions.appendChild(btnDelete);
    });
  } catch (err) {
    console.error('Error al obtener préstamos:', err);
  }
}

function cargarParaEdicion(p) {
  idprestamo.value = p.id;
  selectCliente.value = p.clienteId || p.cliente || p.id_cliente || '';
  montoPrestado.value = p.montoPrestado;
  fechaPrestamo.value = p.fechaPrestamo ? p.fechaPrestamo.split('T')[0] : (p.fecha || '');
  btnGuardar.innerText = 'Actualizar';
}

async function eliminarPrestamo(id) {
  if (!confirm('¿Seguro que deseas eliminar este préstamo?')) return;
  try {
    await fetch(`${API_PRESTAMOS}/${id}`, { method: 'DELETE' });
    obtenerPrestamos();
  } catch (err) {
    console.error('Error al eliminar préstamo:', err);
  }
}

// buscar cliente por DNI (usa endpoint clientes/:id si existe, aquí hacemos búsqueda local)
async function buscarClientePorDNI(dni) {
  try {
    const res = await fetch(API_CLIENTES);
    const clientes = await res.json();
    const encontrado = clientes.find(c => (c.dni && c.dni.toString() === dni.toString()));
    if (encontrado) {
      alert(`Cliente encontrado: ${encontrado.nombre} (ID: ${encontrado.id})`);
      selectCliente.value = encontrado.id;
    } else {
      alert('No se encontró cliente con ese DNI');
    }
  } catch (err) {
    console.error('Error busqueda DNI:', err);
  }
}

// submit crear / actualizar
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    clienteId: selectCliente.value,
    montoPrestado: parseFloat(montoPrestado.value) || 0,
    saldoPendiente: parseFloat(montoPrestado.value) || 0, // al crear saldo = monto
    fechaPrestamo: fechaPrestamo.value
  };

  const id = idprestamo.value;
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_PRESTAMOS}/${id}` : API_PRESTAMOS;

  try {
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    form.reset();
    idprestamo.value = '';
    btnGuardar.innerText = 'Registrar';
    obtenerPrestamos();
  } catch (err) {
    console.error('Error al guardar préstamo:', err);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  cargarClientesSelect();
  obtenerPrestamos();
});
