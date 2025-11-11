// === CONFIGURACIÓN ===
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

// === BOTÓN CANCELAR ===
btnCancelar.addEventListener('click', () => {
  btnGuardar.innerText = 'Registrar';
  formulario.reset();
  idcliente.value = '';
});

// === OBTENER Y RENDERIZAR CLIENTES ===
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

// === CARGAR CLIENTE PARA EDICIÓN ===
function cargarParaEdicion(clienteObj) {
  idcliente.value = clienteObj.id;
  nombre.value = clienteObj.nombre;
  email.value = clienteObj.email;
  telefono.value = clienteObj.telefono;
  btnGuardar.innerText = 'Actualizar';
}

// === ELIMINAR CLIENTE CON CONFIRMACIÓN ===
async function eliminarCliente(id, nombreCliente) {
  const confirmacion = await Swal.fire({
    title: `¿Eliminar a ${nombreCliente}?`,
    text: "Esta acción no se puede deshacer",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  });

  if (confirmacion.isConfirmed) {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'delete' });
      obtenerClientes();

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Cliente eliminado correctamente",
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error al eliminar cliente:', error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo eliminar el cliente."
      });
    }
  }
}

// === GUARDAR / ACTUALIZAR CLIENTE ===
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
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo guardar el cliente. Verifique los datos.",
      });
      return;
    }

    formulario.reset();
    idcliente.value = '';
    btnGuardar.innerText = 'Registrar';
    obtenerClientes();

    // ✅ Éxito visual (toast elegante)
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: id ? "Cliente actualizado correctamente" : "Cliente registrado correctamente",
      showConfirmButton: false,
      timer: 1500
    });

  } catch (error) {
    console.error('Error al guardar cliente:', error);
    Swal.fire({
      icon: "error",
      title: "Error de conexión",
      text: "No se pudo conectar con el servidor.",
      footer: "Verifique que el servidor esté en ejecución"
    });
  }
});

// === BUSCADOR EN TIEMPO REAL ===
inputBuscar.addEventListener('input', () => {
  const texto = inputBuscar.value.toLowerCase();
  const filas = tablaClientes.getElementsByTagName('tr');

  for (let fila of filas) {
    const nombre = fila.cells[1].textContent.toLowerCase(); // nombre en 2da columna
    fila.style.display = nombre.includes(texto) ? '' : 'none';
  }
});

// === CARGAR CLIENTES AL INICIAR ===
document.addEventListener('DOMContentLoaded', obtenerClientes);
