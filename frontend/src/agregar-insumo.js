// src/agregar-insumo.js
import { registrarActividad } from "./services/actividadUtilidad";
import { getInsumos } from "./services/InsumoService";
import {
  createSolicitud,
  getUltimaSolicitud,
  getSolicitudes, // <-- IMPORTA getSolicitudes para verificar duplicados
} from "./services/SolicitudServices";
// Importa los servicios necesarios al inicio del archivo
import { createItemSolicitud } from "./services/ItemSolicitudService.js";

// estetica
import { definirUsuario } from './services/usuarioEncabezado.js';

document.addEventListener("DOMContentLoaded", () => {
  try {
    console.log('DOM cargado, ejecutando definirUsuario...');
    definirUsuario();
  } catch (e) {
    console.warn('Error ejecutando definirUsuario', e);
  }
});

// obtener insumos (top-level await, archivo debe cargarse como module)
let insumos = [];
try {
  insumos = await getInsumos() || [];
} catch (err) {
  console.error("No se pudieron cargar insumos:", err);
  insumos = [];
}
console.log("insumos:", insumos);

// obtener usuarioActual de forma segura (fallback a null si no está)
const usuarioActualRaw = localStorage.getItem("usuarioActual");
const usuarioActual = usuarioActualRaw ? Number(usuarioActualRaw) : null;

// STORAGE KEYS
const STORAGE_KEY_INSUMOS = "sigia_insumos"; ///ESTE ES PARA LOS QUE VOY ELIGIENDO
const STORAGE_KEY_FORM = 'sigia_form_cargar_nota'; //ESTO ES SOBRE LOS DATOS DE LA NOTA

// Función para almacenar insumos elegidos con datos completos
function almacenarInsumosElegidos(nombreInsumo, cantidadElegida) {
  cantidadElegida = Number(cantidadElegida) || 0;
  if (cantidadElegida <= 0) {
    alert('Cantidad inválida');
    return false;
  }

  // Obtener insumos ya guardados
  let insumosElegidos = getInsumosGuardados();

  // Buscar el insumo completo en la lista original
  const insumoCompleto = insumos.find(i => i.nombre === nombreInsumo);
  if (!insumoCompleto) {
    console.warn('No se encontró el insumo original:', nombreInsumo);
    return false;
  }

  const stockOriginal = Number(insumoCompleto.stockActual) || 0;

  const idxExistente = insumosElegidos.findIndex(
    x => (x.idInsumo != null && x.idInsumo === insumoCompleto.idInsumo) || (x.nombre === nombreInsumo)
  );

  if (idxExistente >= 0) {
    // Ya hay un registro: calculamos cuánto ya se pidió
    const almacenado = insumosElegidos[idxExistente];
    // calculamos cuánto se había pedido ya: stockOriginal - almacenado.stockActual
    const solicitadoExistente = Number(insumoCompleto.stockActual) - Number(almacenado.stockActual);
    const nuevoSolicitado = solicitadoExistente + cantidadElegida;

    if (nuevoSolicitado > stockOriginal) {
      alert(`No hay suficiente stock. Ya solicitaste ${solicitadoExistente} y pediste ${cantidadElegida}. Stock disponible total: ${stockOriginal}.`);
      return false;
    }

    // Actualizamos el stock restante guardado
    almacenado.stockActual = stockOriginal - nuevoSolicitado;

    // Actualizamos otros campos por si cambiaron
    almacenado.categoria = insumoCompleto.categoria;
    almacenado.critico = insumoCompleto.critico;
    almacenado.stockMinimo = insumoCompleto.stockMinimo;
    almacenado.idInsumo = insumoCompleto.idInsumo;
    // no cambiamos nombre

    // Guardamos y retornamos
    insumosElegidos[idxExistente] = almacenado;
    guardarInsumos(insumosElegidos);
    return true;
  } else {
    // No existe aún: verificamos que la cantidad pedida no supere el stock
    if (cantidadElegida > stockOriginal) {
      alert(`La cantidad solicitada (${cantidadElegida}) supera el stock disponible (${stockOriginal}).`);
      return false;
    }

    const nuevoRegistro = {
      categoria: insumoCompleto.categoria,
      critico: insumoCompleto.critico,
      idInsumo: insumoCompleto.idInsumo,
      nombre: insumoCompleto.nombre,
      // guardamos stock restante
      stockActual: stockOriginal - cantidadElegida,
      stockMinimo: insumoCompleto.stockMinimo
    };

    insumosElegidos.push(nuevoRegistro);
    guardarInsumos(insumosElegidos);
    return true;
  }
}

// DOM references
const selectInsumo = document.querySelector('select[name="nombre_insumo"]');
const inputCantidad = document.querySelector('input[name="cantidad"]');
const stockDiv = document.getElementById("stock-message");

// asegurarnos elementos existen
if (!selectInsumo) throw new Error("select[name='nombre_insumo'] no encontrado en el DOM");
if (!inputCantidad) throw new Error("input[name='cantidad'] no encontrado en el DOM");
if (!stockDiv) console.warn("stock-message no encontrado, se ignorarán mensajes de stock.");

// Limpiar / preparar stockDiv
stockDiv.innerHTML = "";
const pStock = document.createElement("p");
pStock.setAttribute("class", "text-sm font-bold");
stockDiv.appendChild(pStock);
stockDiv.style.display = "none";

// poblar select con insumos (añado opción por defecto)
selectInsumo.innerHTML = '<option value="">Seleccionar insumo</option>';
for (let insumo of insumos) {
  const option = document.createElement("option");
  option.value = insumo.nombre;
  option.innerText = insumo.nombre;
  selectInsumo.appendChild(option);
}

// Función que actualiza y muestra/oculta stockDiv según selección y cantidad
function updateStockDiv() {
  const nombreSel = selectInsumo.value;
  const insumoSeleccionado = insumos.find(i => i.nombre === nombreSel);

  if (!insumoSeleccionado) {
    stockDiv.style.display = "none";
    pStock.textContent = "";
    return;
  }

  const stockActual = Number(insumoSeleccionado.stockActual || 0);
  const cantidadIngresada = Number(inputCantidad.value || 0);

  stockDiv.style.display = "block";
  stockDiv.style.color = "inherit";

  if (cantidadIngresada > 0 && cantidadIngresada > stockActual) {
    pStock.textContent = "Superaste la cantidad máxima disponible";
    pStock.style.color = "red";
  } else {
    pStock.textContent = `Stock disponible: ${stockActual}`;
    pStock.style.color = "inherit";
  }
}

// eventos para actualizar stockDiv
selectInsumo.addEventListener("change", () => {
  updateStockDiv();
});

inputCantidad.addEventListener("input", () => {
  updateStockDiv();
});

// Manipulacion del local storage
function getInsumosGuardados() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY_INSUMOS)) || [];
}
function guardarInsumos(insumos) {
  localStorage.setItem(STORAGE_KEY_INSUMOS, JSON.stringify(insumos));
}

// Elementos para modales
const modalConfirmacion = document.getElementById("modal-confirmacion");
const modalExito = document.getElementById("modal-exito");
const modalConfirmacionCarga = document.getElementById("modal-confirmacion-carga");
const modalExitoFinal = document.getElementById("modal-exito-final");

const btnCancelar = document.getElementById("btn-cancelar");
const btnConfirmar = document.getElementById("btn-confirmar");
const btnAgregarOtro = document.getElementById("btn-agregar-otro");
const btnConfirmarListado = document.getElementById("btn-confirmar-listado");
const btnCancelarCarga = document.getElementById("btn-cancelar-carga");
const btnConfirmarCarga = document.getElementById("btn-confirmar-carga");
const btnContinuarFinal = document.getElementById("btn-continuar-final");

const modalNombre = document.getElementById("modal-nombre");
const modalCantidad = document.getElementById("modal-cantidad");

const modalCargaTramite = document.getElementById("modal-carga-tramite");
const modalCargaArea = document.getElementById("modal-carga-area");
const modalCargaNombre = document.getElementById("modal-carga-nombre");
const modalCargaFecha = document.getElementById("modal-carga-fecha");
const modalCargaListaInsumos = document.getElementById("modal-carga-lista-insumos");

// cargar datos previos de form para modal (si existen)
let datoForm = JSON.parse(localStorage.getItem(STORAGE_KEY_FORM) || '{}');
modalCargaTramite && (modalCargaTramite.textContent = datoForm.numero_tramite || '');
modalCargaArea && (modalCargaArea.textContent = datoForm.area || '');
modalCargaNombre && (modalCargaNombre.textContent = datoForm.nombre_solicitante || '');
modalCargaFecha && (modalCargaFecha.textContent = datoForm.fecha_solicitud || '');

const form = document.querySelector("form");

// submit del mini-formulario (agregar insumo)
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = selectInsumo.value;
  const cantidad = parseInt(inputCantidad.value);
  const insumoSeleccionado = insumos.find((i) => i.nombre === nombre);

  if (!nombre || !cantidad) {
    alert("Por favor completa todos los campos");
    return;
  }

  if (!insumoSeleccionado) {
    alert("Seleccione un insumo válido");
    return;
  }

  if (cantidad > insumoSeleccionado.stockActual) {
    alert("La cantidad supera el stock disponible");
    return;
  }

  // rellenar modal confirmación
  modalNombre && (modalNombre.textContent = nombre);
  modalCantidad && (modalCantidad.textContent = cantidad);

  modalConfirmacion && (modalConfirmacion.style.display = "flex");
});

btnCancelar && btnCancelar.addEventListener("click", () => {
  modalConfirmacion && (modalConfirmacion.style.display = "none");
});

btnConfirmar && btnConfirmar.addEventListener("click", () => {
  const nombre = modalNombre.textContent;
  const cantidad = parseInt(modalCantidad.textContent);

  const ok = almacenarInsumosElegidos(nombre, cantidad);
  if (!ok) {
    // si no se pudo almacenar, dejamos el modal abierto o informamos
    alert("No se pudo agregar el insumo. Revisa la consola.");
    return;
  }

  modalConfirmacion && (modalConfirmacion.style.display = "none");
  modalExito && (modalExito.style.display = "flex");

  inputCantidad.value = "";
  // ocultamos stockDiv aquí (lo volveremos a mostrar si el usuario pulsa 'Agregar otro')
  stockDiv.style.display = "none";
});

btnAgregarOtro && btnAgregarOtro.addEventListener("click", () => {
  modalExito && (modalExito.style.display = "none");
  // limpiar cantidad y mostrar stockDiv actualizado
  inputCantidad.value = "";
  updateStockDiv();
  selectInsumo.focus();
});

btnConfirmarListado && btnConfirmarListado.addEventListener("click", () => {
  modalExito && (modalExito.style.display = "none");
  mostrarModalConfirmacionCarga();
});

function mostrarModalConfirmacionCarga() {
  const formData = JSON.parse(localStorage.getItem(STORAGE_KEY_FORM)) || {};

  modalCargaTramite && (modalCargaTramite.textContent = formData.numero_tramite || '');
  modalCargaArea && (modalCargaArea.textContent = formData.area || '');
  modalCargaNombre && (modalCargaNombre.textContent = formData.nombre_solicitante || '');
  modalCargaFecha && (modalCargaFecha.textContent = formData.fecha_solicitud || '');

  const fechaActual = new Date().toLocaleDateString("es-AR");
  const elFecha = document.getElementById("modal-carga-fecha");
  elFecha && (elFecha.textContent = fechaActual);

  const insumosGuardados = getInsumosGuardados();
  const listaInsumos = document.getElementById("modal-carga-lista-insumos");
  if (listaInsumos) listaInsumos.innerHTML = "";

  insumosGuardados.forEach((insumo) => {
    const insumoOriginal = insumos.find((orig) => orig.nombre === insumo.nombre);
    const cantidadElegida = insumoOriginal ? (insumoOriginal.stockActual - insumo.stockActual) : 0;

    const insumoDiv = document.createElement("div");
    insumoDiv.className = "bg-[#F7EEC3] rounded-full px-4 py-2 flex justify-between items-center";
    insumoDiv.innerHTML = `
        <span class="font-medium">${insumo.nombre}</span>
        <span class="font-bold">${cantidadElegida}</span>
    `;
    listaInsumos && listaInsumos.appendChild(insumoDiv);
  });

  modalConfirmacionCarga && (modalConfirmacionCarga.style.display = "flex");
}

btnCancelarCarga && btnCancelarCarga.addEventListener("click", () => {
  modalConfirmacionCarga && (modalConfirmacionCarga.style.display = "none");
  modalExito && (modalExito.style.display = "flex");
});

btnConfirmarCarga && btnConfirmarCarga.addEventListener("click", async () => {
  try {
    const formData = JSON.parse(localStorage.getItem(STORAGE_KEY_FORM)) || {};
    const insumosGuardados = getInsumosGuardados();

    // Si querés, acá podés agregar validación adicional, p. ej. que el número de trámite no esté vacío, etc.
    const nroTramite = formData.numero_tramite || "";
    const areaSolicitante = formData.area || "Posgrado";
    const nombreSolicitante = formData.nombre_solicitante || "Omar Luna";
    const fechaActual = formData.fecha_solicitud || new Date().toISOString().split('T')[0];
    const estado = "Pendiente";

    // === NUEVA VERIFICACIÓN: que no exista nroTramite en backend ===
    if (nroTramite && nroTramite.trim() !== "") {
      try {
        const solicitudes = await getSolicitudes();
        const buscado = String(nroTramite).trim().toLowerCase();
        const existe = (solicitudes || []).some(s => {
          const campo = (s.nroTramite ?? s.nro ?? s.numero_tramite ?? s.numero ?? "").toString().trim().toLowerCase();
          return campo === buscado;
        });
        if (existe) {
          // Mostrar error y abortar la carga
          alert(`Ya existe una nota con número de trámite "${nroTramite}". No se puede duplicar.`);
          console.warn("Duplicado nroTramite detectado, abortando creación de solicitud:", nroTramite);
          return;
        }
      } catch (err) {
        // Si falla la verificación en backend, informamos y abortamos por seguridad
        console.error("No se pudo verificar existencia de nroTramite:", err);
        alert("No se pudo verificar si el número de trámite ya existe. Intente nuevamente más tarde.");
        return;
      }
    } else {
      // Si no hay número, podés elegir si permitís crear sin número. Por ahora lo bloqueamos.
      alert("El número de trámite es obligatorio. Completa el número antes de confirmar la carga.");
      return;
    }

    const solicitud = {
      nroTramite: nroTramite,
      fecha: fechaActual,
      estado: estado,
      area: areaSolicitante,
      solicitante: nombreSolicitante,
    };

    console.log("Creando solicitud:", solicitud);
    await createSolicitud(solicitud);

    const solicitudCreada = await getUltimaSolicitud();
    console.log("Solicitud obtenida:", solicitudCreada);

    for (let insumoGuardado of insumosGuardados) {
      const insumoOriginal = insumos.find((orig) => orig.nombre === insumoGuardado.nombre);
      const cantidadSolicitada = insumoOriginal ? (insumoOriginal.stockActual - insumoGuardado.stockActual) : 0;

      const itemSolicitud = {
        idSolicitud: solicitudCreada.idSolicitud,
        idInsumo: insumoGuardado.idInsumo,
        cantSolicitada: cantidadSolicitada,
        cantEntregada: cantidadSolicitada,
      };

      console.log("Creando item solicitud:", itemSolicitud);
      await createItemSolicitud(itemSolicitud);
    }

    await registrarActividad(
      usuarioActual,
      "Carga de solicitud",
      "Se cargó una solicitud en nota de entrada",
      areaSolicitante
    );

    console.log("Proceso completado exitosamente");

    // limpiar almacenamiento local relacionado
    localStorage.removeItem(STORAGE_KEY_INSUMOS);

    modalConfirmacionCarga && (modalConfirmacionCarga.style.display = "none");
    modalExitoFinal && (modalExitoFinal.style.display = "flex");
  } catch (error) {
    console.error("Error al procesar la solicitud:", error);
    alert("Error al procesar la solicitud: " + (error.message || error));
  }
});

btnContinuarFinal && btnContinuarFinal.addEventListener("click", () => {
  modalExitoFinal && (modalExitoFinal.style.display = "none");
  window.location.href = "cargar-nota.html";
});

// cerrar modales al click fuera
[
  modalConfirmacion,
  modalExito,
  modalConfirmacionCarga,
  modalExitoFinal,
].forEach((modal) => {
  if (!modal) return;
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});
