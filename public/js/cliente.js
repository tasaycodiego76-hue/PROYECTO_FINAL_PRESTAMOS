const API_URL = 'http://localhost:3000/api/clientes';

const formulario = document.getElementById('form-cliente');
const tabla = document.querySelector('#tabla-clientes');
const idcliente = document.getElementById('idcliente');
const nombre = document.getElementById('nombre');
const email = document.getElementById('email');
const telefono = document.getElementById('telefono');
const btnGuardar = document.getElementById('btnGuardar');
const btnCancelar = document.getElementById('btnCancelar');
const inputBuscar = document.getElementById('buscarCliente');
const tablaClientes = document.getElementById('tabla-clientes'); 

btnCancelar.addEventListener('click', () => {
  btnGuardar.innerText = 'Registrar';
  formulario.reset();
  idcliente.value = '';
});

// Obtener y renderizar clientes
async function obtenerClientes() {
  try {
    const response = await fetch(API_URL);
    const clientes = await response.json();
    tabla.innerHTML = '';

    clientes.forEach(c => {
      const row = tabla.insertRow();
      row.insertCell().textContent = c.id;
      row.insertCell().textContent = c.nombre;
      row.insertCell().textContent = c.email || '';
      row.insertCell().textContent = c.telefono || '';

      const acciones = row.insertCell();

      const btnEditar = document.createElement('button');
      btnEditar.textContent = 'Editar';
      btnEditar.classList.add('btn', 'btn-info', 'btn-sm', 'me-1');
      btnEditar.onclick = () => cargarParaEdicion(c);

      const btnEliminar = document.createElement('button');
      btnEliminar.textContent = 'Eliminar';
      btnEliminar.classList.add('btn', 'btn-danger', 'btn-sm');
      btnEliminar.onclick = () => eliminarCliente(c.id, c.nombre);

      acciones.appendChild(btnEditar);
      acciones.appendChild(btnEliminar);
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
  }
}

// Cargar cliente para editar
function cargarParaEdicion(clienteObj) {
  idcliente.value = clienteObj.id;
  nombre.value = clienteObj.nombre;
  email.value = clienteObj.email;
  telefono.value = clienteObj.telefono;
  btnGuardar.innerText = 'Actualizar';
}

// Eliminar cliente
async function eliminarCliente(id, nombreCliente) {
  if (confirm(`¿Seguro que deseas eliminar a: ${nombreCliente}?`)) {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'delete' });
      obtenerClientes();
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
    }
  }
}

// Guardar / actualizar cliente
formulario.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    nombre: nombre.value.trim(),
    email: email.value.trim(),
    telefono: telefono.value.trim()
  };

  const id = idcliente.value;
  const method = id ? 'put' : 'post';
  const url = id ? `${API_URL}/${id}` : API_URL;

  try {
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    formulario.reset();
    idcliente.value = '';
    btnGuardar.innerText = 'Registrar';
    obtenerClientes();
  } catch (error) {
    console.error('Error al guardar cliente:', error);
  }
});

inputBuscar.addEventListener('input', () => {
  const texto = inputBuscar.value.toLowerCase();
  const filas = tablaClientes.getElementsByTagName('tr');

  for (let fila of filas) {
    const nombre = fila.cells[1].textContent.toLowerCase(); // suponiendo que el nombre está en la 2da columna
    fila.style.display = nombre.includes(texto) ? '' : 'none';
  }
});

document.addEventListener('DOMContentLoaded', obtenerClientes);
