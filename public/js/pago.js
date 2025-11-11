/* js/pago.js - versión corregida para comportamiento solicitado */
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

/* estilo y readonly */
saldoPendiente.readOnly = true;
saldoPendiente.style.backgroundColor = '#f0f0f0';
saldoPendiente.style.fontWeight = 'bold';

/* cancelar */
btnCancelar.addEventListener('click', () => {
  formulario.reset();
  idpago.value = '';
  saldoPendiente.value = '';
  btnGuardar.innerText = 'Guardar';
});

/* helper: calcula total (capital + interés). Maneja dos posibles esquemas:
   - si existe interesPorcentaje (ej: 10) calcula monto + monto * interesPorcentaje/100
   - si existe interes (valor absoluto) suma directo
*/
function calcularTotalConInteres(prestamo) {
  const monto = parseFloat(prestamo.montoPrestado) || 0;
  if (prestamo.interesPorcentaje != null && prestamo.interesPorcentaje !== undefined) {
    const pct = parseFloat(prestamo.interesPorcentaje) || 0;
    return monto + (monto * pct / 100);
  }
  // si hay campo 'interes' absoluto (por compatibilidad)
  const interesAbs = parseFloat(prestamo.interes) || 0;
  return monto + interesAbs;
}

/* Carga prestamos pero SOLO los que tengan saldo pendiente > 0.
   En la lista solo muestra el nombre (sin montos).
*/
async function cargarPrestamos() {
  try {
    const res = await fetch(API_PRESTAMOS);
    if (!res.ok) throw new Error('Error al cargar préstamos');
    prestamosGlobales = await res.json();

    selectPrestamo.innerHTML = '<option value="">Seleccione...</option>';

    // filtramos locales calculando saldo real por cada préstamo
    prestamosGlobales.forEach(p => {
      const totalConInteres = calcularTotalConInteres(p);
      // p.montoPagadoTotal puede no existir en tu API; calculamos después con pagos si hace falta.
      // Para decisión rápida, asumimos p.saldoPendiente si existe en backend (si no, lo consideramos total - 0)
      const saldoBackend = (p.saldoPendiente !== undefined && p.saldoPendiente !== null)
        ? parseFloat(p.saldoPendiente)
        : (totalConInteres - (parseFloat(p.montoPagadoTotal) || 0));

      if (saldoBackend > 0.001) {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.cliente; // SOLO nombre
        selectPrestamo.appendChild(opt);
      }
    });
  } catch (err) {
    console.error('cargarPrestamos error:', err);
  }
}

/* obtiene todos los pagos y filtra por prestamoId */
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

/* Actualiza el campo saldoPendiente mostrando (capital + interés - sumPagos) */
async function actualizarSaldoPendiente(prestamoId) {
  if (!prestamoId) {
    saldoPendiente.value = '';
    return;
  }

  // buscar préstamo en memoria
  const prestamo = prestamosGlobales.find(p => String(p.id) === String(prestamoId));
  if (!prestamo) {
    // intenta recargar globales si no está
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
  // NO mostramos alerta aquí (según tu pedido): la alerta solo cuando se registre el pago final
}

/* Al cambiar selección solo actualizamos saldo (sin alertas) */
selectPrestamo.addEventListener('change', () => {
  actualizarSaldoPendiente(selectPrestamo.value);
});

/* Mostrar tabla de pagos */
/* Mostrar tabla de pagos */
async function obtenerPagos() {
  try {
    const res = await fetch(API_PAGOS);
    if (!res.ok) throw new Error('Error al obtener pagos');
    const pagos = await res.json();

    tabla.innerHTML = '';
    pagos.forEach(p => {
      const row = tabla.insertRow();
      row.insertCell().textContent = p.id;
      row.insertCell().textContent = p.cliente;

      // buscar préstamo para calcular total con interés
      const prestamoRelacionado = prestamosGlobales.find(pr => String(pr.id) === String(p.prestamoId));
      let totalConInteres = parseFloat(p.montoPrestado) || 0;
      if (prestamoRelacionado) {
        totalConInteres = calcularTotalConInteres(prestamoRelacionado);
      }

      row.insertCell().textContent = totalConInteres.toFixed(2); // monto con interés incluido
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

      const actions = row.insertCell();
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Editar';
      editBtn.className = 'btn btn-info btn-sm me-1';
      editBtn.onclick = () => cargarParaEdicion(p);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Eliminar';
      deleteBtn.className = 'btn btn-danger btn-sm';
      deleteBtn.onclick = () => eliminarPago(p.id, p.cliente);

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
    });
  } catch (err) {
    console.error('obtenerPagos error:', err);
  }
}


/* cargar en edición */
function cargarParaEdicion(p) {
  idpago.value = p.id;
  selectPrestamo.value = p.prestamoId;
  montoPago.value = p.montoPagado;
  fechaPago.value = (p.fechaPago || '').split('T')[0] || '';
  metodoPago.value = p.metodoPago || '';
  btnGuardar.innerText = 'Actualizar';
  actualizarSaldoPendiente(p.prestamoId);
}

/* eliminar pago */
async function eliminarPago(id, cliente) {
  if (!confirm(`¿Seguro que desea eliminar el pago de ${cliente}?`)) return;
  try {
    const res = await fetch(`${API_PAGOS}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar');
    await obtenerPagos();
    await cargarPrestamos();
    if (selectPrestamo.value) await actualizarSaldoPendiente(selectPrestamo.value);
  } catch (err) {
    console.error('eliminarPago error:', err);
    Swal.fire({ title: 'Error al eliminar', icon: 'error' });
  }
}

/* Guardar / actualizar pago.
   IMPORTANTE: después de guardar calculamos el nuevo saldo y si queda <= 0
   mostramos **solo en este momento** el mensaje de préstamo completado y eliminamos
   al cliente de la lista (con cargarPrestamos()).
*/
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

    // recalculamos saldo después del POST
    // recargamos prestamos y pagos para tener datos frescos
    await obtenerPagos();
    await cargarPrestamos();

    // obtener préstamo fresco (desde prestamosGlobales recargadas)
    const prestamo = prestamosGlobales.find(p => String(p.id) === String(prestamoId));
    const pagos = await obtenerPagosPorPrestamo(prestamoId);
    const totalPagado = pagos.reduce((acc, it) => acc + (parseFloat(it.montoPagado) || 0), 0);
    const totalConInteres = calcularTotalConInteres(prestamo);
    const saldoReal = totalConInteres - totalPagado;

    // Mensaje final: si saldoReal <= 0 -> mostrar mensaje especial
    if (saldoReal <= 0.001) {
      await Swal.fire({
        title: "¡Préstamo cancelado! Este cliente ya completó todos sus pagos",
        icon: "success",
        draggable: true
      });
      // actualizar lista (ya recargada) — el cliente ya no aparecerá
      await cargarPrestamos();
      selectPrestamo.value = '';
      saldoPendiente.value = '';
    } else {
      // pago normal
      await Swal.fire({
        title: "Pago registrado correctamente",
        icon: "success",
        timer: 1300,
        showConfirmButton: false
      });
      // actualizar saldo visible
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

/* Init */
document.addEventListener('DOMContentLoaded', async () => {
  await cargarPrestamos();
  await obtenerPagos();
});
