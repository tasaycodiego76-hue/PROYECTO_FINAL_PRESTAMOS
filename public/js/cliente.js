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
      btnEliminar.textContent = 'Desactivar';
      btnEliminar.classList.add('btn', 'btn-danger', 'btn-sm');
      btnEliminar.onclick = () => eliminarCliente(c.id, c.nombre);

      acciones.appendChild(btnEditar);
      acciones.appendChild(btnEliminar);
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
  }
}

function cargarParaEdicion(clienteObj) {
  idcliente.value = clienteObj.id;
  nombre.value = clienteObj.nombre;
  email.value = clienteObj.email;
  telefono.value = clienteObj.telefono;
  btnGuardar.innerText = 'Actualizar';
}

async function eliminarCliente(id, nombreCliente) {
  const confirmacion = await Swal.fire({
    title: `¿Desactivar a ${nombreCliente}?`,
    text: "El cliente y sus préstamos se marcarán como inactivos",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Sí, desactivar",
    cancelButtonText: "Cancelar"
  });

  if (confirmacion.isConfirmed) {
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      obtenerClientes();

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Cliente desactivado correctamente",
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      console.error('Error al desactivar cliente:', error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo desactivar el cliente."
      });
    }
  }
}

// Ver clientes inactivos
async function verClientesInactivos() {
  try {
    const response = await fetch(`${API_URL}/inactivos`);
    const inactivos = await response.json();

    if (inactivos.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Sin clientes inactivos",
        text: "No hay clientes desactivados"
      });
      return;
    }

    let html = '<div style="max-height: 400px; overflow-y: auto;">';
    html += '<table class="table table-sm">';
    html += '<thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Acción</th></tr></thead><tbody>';
    
    inactivos.forEach(c => {
      html += `
        <tr>
          <td>${c.id}</td>
          <td>${c.nombre}</td>
          <td>${c.email || '-'}</td>
          <td>
            <button class="btn btn-success btn-sm" onclick="reactivarCliente(${c.id}, '${c.nombre}')">
              Reactivar
            </button>
          </td>
        </tr>
      `;
    });
    
    html += '</tbody></table></div>';

    Swal.fire({
      title: "Clientes Inactivos",
      html: html,
      width: 600,
      showConfirmButton: false,
      showCloseButton: true
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

async function reactivarCliente(id, nombreCliente) {
  const confirmacion = await Swal.fire({
    title: `¿Reactivar a ${nombreCliente}?`,
    text: "El cliente volverá a estar activo con todo su historial",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#28a745",
    cancelButtonColor: "#6c757d",
    confirmButtonText: "Sí, reactivar",
    cancelButtonText: "Cancelar"
  });

  if (confirmacion.isConfirmed) {
    try {
      await fetch(`${API_URL}/${id}/reactivar`, { method: 'PATCH' });
      
      Swal.fire({
        icon: "success",
        title: "Cliente reactivado",
        text: `${nombreCliente} está activo nuevamente`,
        timer: 1500,
        showConfirmButton: false
      });

      obtenerClientes();
      verClientesInactivos();
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: "error",
        title: "Error al reactivar"
      });
    }
  }
}

formulario.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    nombre: nombre.value.trim(),
    email: email.value.trim(),
    telefono: telefono.value.trim()
  };

  const id = idcliente.value;
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_URL}/${id}` : API_URL;

  try {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      // Si existe cliente inactivo con el mismo nombre
      if (result.clienteInactivo) {
        const confirmacion = await Swal.fire({
          icon: "warning",
          title: "Cliente Inactivo Encontrado",
          text: result.mensaje,
          showCancelButton: true,
          confirmButtonText: "Sí, reactivar",
          cancelButtonText: "Cancelar",
          confirmButtonColor: "#28a745"
        });

        if (confirmacion.isConfirmed) {
          await fetch(`${API_URL}/${result.clienteId}/reactivar`, { method: 'PATCH' });
          
          Swal.fire({
            icon: "success",
            title: "Cliente reactivado correctamente",
            timer: 1500,
            showConfirmButton: false
          });

          formulario.reset();
          obtenerClientes();
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.mensaje
        });
      }
      return;
    }

    formulario.reset();
    idcliente.value = '';
    btnGuardar.innerText = 'Registrar';
    obtenerClientes();

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
      text: "No se pudo conectar con el servidor."
    });
  }
});

inputBuscar.addEventListener('input', () => {
  const texto = inputBuscar.value.toLowerCase();
  const filas = tablaClientes.getElementsByTagName('tr');

  for (let fila of filas) {
    const nombre = fila.cells[1].textContent.toLowerCase();
    fila.style.display = nombre.includes(texto) ? '' : 'none';
  }
});

document.addEventListener('DOMContentLoaded', obtenerClientes);