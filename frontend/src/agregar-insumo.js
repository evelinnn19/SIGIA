import { registrarActividad } from "./services/actividadUtilidad";
import { getInsumos } from "./services/InsumoService";
import {
  createSolicitud,
  getUltimaSolicitud,
} from "./services/SolicitudServices";
// Importa los servicios necesarios al inicio del archivo
import { createItemSolicitud } from "./services/ItemSolicitudService.js";


//estetica
    import { definirUsuario } from './services/usuarioEncabezado.js';

    document.addEventListener("DOMContentLoaded", () => {
        console.log('DOM cargado, ejecutando definirUsuario...');
        definirUsuario();
    });
//





const insumos = await getInsumos();
console.log(insumos);

// obtener usuarioActual de forma segura (fallback a null si no está)
const usuarioActualRaw = localStorage.getItem("usuarioActual");
const usuarioActual = usuarioActualRaw ? Number(usuarioActualRaw) : null;

// // src/agregar-insumo.js
// // Script mejorado para agregar-insumo.html
const STORAGE_KEY_INSUMOS = "sigia_insumos"; ///ESTE ES PARA LOS QUE VOY ELIGIENDO
const STORAGE_KEY_FORM = "sigia_form_cargar_nota"; //ESTO ES SOBRE LOS DATOS DE LA NOTA

//Deberíamos guuardar en un localStorage los insumos que elegimos.
// Función para almacenar insumos elegidos con datos completos
function almacenarInsumosElegidos(nombreInsumo, cantidadElegida) {
  // Obtener insumos ya guardados
  let insumosElegidos =
    JSON.parse(localStorage.getItem(STORAGE_KEY_INSUMOS)) || [];

  // Buscar el insumo completo en la lista original
  const insumoCompleto = insumos.find(
    (insumo) => insumo.nombre === nombreInsumo
  );

  if (insumoCompleto) {
    // Crear objeto con datos completos del insumo + cantidad elegida
    const insumoElegido = {
      categoria: insumoCompleto.categoria,
      critico: insumoCompleto.critico,
      idInsumo: insumoCompleto.idInsumo,
      nombre: insumoCompleto.nombre,
      stockActual: insumoCompleto.stockActual - cantidadElegida,
      stockMinimo: insumoCompleto.stockMinimo,
    };

    // Agregar a la lista
    insumosElegidos.push(insumoElegido);

    // Guardar en localStorage
    localStorage.setItem(STORAGE_KEY_INSUMOS, JSON.stringify(insumosElegidos));
  }
}

// // Elementos del DOM
//Mini formulario Nombre y cantidad
const selectInsumo = document.querySelector('select[name="nombre_insumo"]');
selectInsumo.innerHTML = "";
const inputCantidad = document.querySelector('input[name="cantidad"]');
inputCantidad.value = "";
const stockDiv = document.getElementById("stock-message");

// Limpiás el contenido anterior
stockDiv.innerHTML = "";

// Creás el <p> y lo configurás
const p = document.createElement("p");
p.setAttribute("class", "text-[#B91C1C] text-sm font-bold");
p.textContent = "no hay suficiente stock"; // o el texto dinámico que quieras

// Lo agregás al div
stockDiv.appendChild(p);

// Mostrás el div
stockDiv.style.display = "block";

for (let insumo of insumos) {
  let option = document.createElement("option");
  option.innerText = insumo.nombre;
  selectInsumo.appendChild(option);
}

//evento nuevo para cuando alguien seleccione algo
selectInsumo.addEventListener("change", () => {
  const insumoSeleccionado = insumos.find(
    (i) => i.nombre == selectInsumo.value
  );

  if (insumoSeleccionado) {
    stockDiv.textContent = `Stock disponible: ${insumoSeleccionado.stockActual}`;
  }
});

// Agrego evento cuando el usuario cambia la cantidad
inputCantidad.addEventListener("input", () => {
  const insumoSeleccionado = insumos.find(
    (i) => i.nombre == selectInsumo.value
  );
  stockDiv.textContent = ""; // limpio mensaje anterior

  if (
    insumoSeleccionado &&
    inputCantidad.value > insumoSeleccionado.stockActual
  ) {
    stockDiv.textContent = "Superaste la cantidad máxima disponible";
    stockDiv.style.color = "red";
  } else if (insumoSeleccionado) {
    stockDiv.textContent = `Stock disponible: ${insumoSeleccionado.stockActual}`;
    stockDiv.style.color = "inherit";
  }
});

//Manipulacion del local storage
// Función para obtener insumos guardados
function getInsumosGuardados() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY_INSUMOS)) || [];
}

// Función para guardar insumos
function guardarInsumos(insumos) {
  localStorage.setItem(STORAGE_KEY_INSUMOS, JSON.stringify(insumos));
}

//Elementos para modales

const modalConfirmacion = document.getElementById("modal-confirmacion");
const modalExito = document.getElementById("modal-exito");
const modalConfirmacionCarga = document.getElementById(
  "modal-confirmacion-carga"
);
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
const modalCargaListaInsumos = document.getElementById(
  "modal-carga-lista-insumos"
);

const form = document.querySelector("form");

// Evento del formulario - mostrar modal de confirmación
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = selectInsumo.value;
  const cantidad = parseInt(inputCantidad.value);
  const insumoSeleccionado = insumos.find((i) => i.nombre === nombre);

  // Validaciones
  if (!nombre || !cantidad) {
    alert("Por favor completa todos los campos");
    return;
  }

  if (cantidad > insumoSeleccionado.stockActual) {
    alert("La cantidad supera el stock disponible");
    return;
  }

  // Mostrar datos en el modal de confirmación
  modalNombre.textContent = nombre;
  modalCantidad.textContent = cantidad;

  // Mostrar modal
  modalConfirmacion.style.display = "flex";
});

// Botón cancelar del modal de confirmación
btnCancelar.addEventListener("click", () => {
  modalConfirmacion.style.display = "none";
});

//Es lo que sale al apretar agregar
// Botón confirmar del modal de confirmación
btnConfirmar.addEventListener("click", () => {
  const nombre = modalNombre.textContent;
  const cantidad = parseInt(modalCantidad.textContent);

  almacenarInsumosElegidos(nombre, cantidad);
  // Guardar el insumo

  // Cerrar modal de confirmación y mostrar modal de éxito
  modalConfirmacion.style.display = "none";
  modalExito.style.display = "flex";

  // Limpiar formulario
  inputCantidad.value = "";
  stockDiv.style.display = "none";
});

// Botón agregar otro insumo
btnAgregarOtro.addEventListener("click", () => {
  modalExito.style.display = "none";
  // El formulario ya está limpio, solo enfocar el primer campo
  selectInsumo.focus();
});

// Botón confirmar listado - mostrar modal de confirmación de carga
btnConfirmarListado.addEventListener("click", () => {
  modalExito.style.display = "none";
  mostrarModalConfirmacionCarga();
});

/// Función para mostrar el modal de confirmación de carga
function mostrarModalConfirmacionCarga() {
  // Cargar datos del formulario guardado (si existe)
  const formData = JSON.parse(localStorage.getItem(STORAGE_KEY_FORM)) || {};

  // Llenar los datos del modal (usar datos por defecto si no hay guardados)
  document.getElementById("modal-carga-tramite").textContent =
    formData.numeroTramite || "1515/2025";
  document.getElementById("modal-carga-area").textContent =
    formData.areaSolicitante || "Posgrado";
  document.getElementById("modal-carga-nombre").textContent =
    formData.nombreSolicitante || "Omar Luna";

  // Fecha actual
  const fechaActual = new Date().toLocaleDateString("es-AR");
  document.getElementById("modal-carga-fecha").textContent = fechaActual;

  // Mostrar lista de insumos
  const insumosGuardados = getInsumosGuardados();
  const listaInsumos = document.getElementById("modal-carga-lista-insumos");
  listaInsumos.innerHTML = "";

  insumosGuardados.forEach((insumo) => {
    // Buscar el insumo original para calcular la cantidad elegida
    const insumoOriginal = insumos.find(
      (orig) => orig.nombre === insumo.nombre
    );
    const cantidadElegida = insumoOriginal.stockActual - insumo.stockActual;

    const insumoDiv = document.createElement("div");
    insumoDiv.className =
      "bg-[#F7EEC3] rounded-full px-4 py-2 flex justify-between items-center";
    insumoDiv.innerHTML = `
        <span class="font-medium">${insumo.nombre}</span>
        <span class="font-bold">${cantidadElegida}</span>
    `;
    listaInsumos.appendChild(insumoDiv);
  });

  modalConfirmacionCarga.style.display = "flex";
}

// Eventos del modal de confirmación de carga
document.getElementById("btn-cancelar-carga").addEventListener("click", () => {
  modalConfirmacionCarga.style.display = "none";
  modalExito.style.display = "flex"; // Volver al modal anterior
});

document
  .getElementById("btn-confirmar-carga")
  .addEventListener("click", async () => {
    try {
      // Obtener datos del formulario y insumos guardados
      const formData = JSON.parse(localStorage.getItem(STORAGE_KEY_FORM)) || {};
      const insumosGuardados = getInsumosGuardados();

      const nroTramite = formData.numeroTramite || "1515/2025";
      const areaSolicitante = formData.areaSolicitante || "Posgrado";
      const nombreSolicitante = formData.nombreSolicitante || "Omar Luna";
      const fechaActual = new Date().toISOString().split("T")[0]; // Formato YYYY-MM-DD
      const estado = "Pendiente"; // o el estado inicial que uses

      // Crear solicitud
      const solicitud = {
        // idSolicitud no se envía, lo asigna la BD
        nroTramite: nroTramite,
        fecha: fechaActual,
        estado: estado,
        area: areaSolicitante,
        solicitante: nombreSolicitante,
        // Agrega otros campos que necesites como nombreSolicitante si está en tu modelo
      };

      console.log("Creando solicitud:", solicitud);

      // Crear la solicitud y obtener el ID generado
      await createSolicitud(solicitud);

      const solicitudCreada = await getUltimaSolicitud();
      console.log("Solicitud obtenida:", solicitudCreada);

      // El backend debería devolver la solicitud con el ID asignado
      // Si solo devuelve un mensaje, necesitarás modificar el backend o buscar otra forma de obtener el ID

      // Crear items de solicitud por cada insumo elegido
      for (let insumoGuardado of insumosGuardados) {
        // Buscar el insumo original para calcular la cantidad
        const insumoOriginal = insumos.find(
          (orig) => orig.nombre === insumoGuardado.nombre
        );
        const cantidadSolicitada =
          insumoOriginal.stockActual - insumoGuardado.stockActual;

        const itemSolicitud = {
          // idItem no se envía, lo asigna la BD
          idSolicitud: solicitudCreada.idSolicitud, // Esto depende de lo que devuelva tu backend
          idInsumo: insumoGuardado.idInsumo,
          cantSolicitada: cantidadSolicitada,
          cantEntregada: cantidadSolicitada, // Asumiendo que se entrega todo lo solicitado
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

      // Limpiar localStorage
      localStorage.removeItem(STORAGE_KEY_INSUMOS);

      // Cerrar modal y mostrar éxito final
      modalConfirmacionCarga.style.display = "none";
      modalExitoFinal.style.display = "flex";
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      alert("Error al procesar la solicitud: " + error.message);
    }
  });

// Botón continuar del modal final
document.getElementById("btn-continuar-final").addEventListener("click", () => {
  modalExitoFinal.style.display = "none";
  // Redirigir o realizar otra acción
  window.location.href = "cargar-nota.html";
});

// Cerrar modales al hacer clic fuera de ellos
[
  modalConfirmacion,
  modalExito,
  modalConfirmacionCarga,
  modalExitoFinal,
].forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});
