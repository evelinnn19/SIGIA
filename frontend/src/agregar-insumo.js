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
const STORAGE_KEY_FORM = 'sigia_form_cargar_nota'; //ESTO ES SOBRE LOS DATOS DE LA NOTA

//Deberíamos guuardar en un localStorage los insumos que elegimos.
// Función para almacenar insumos elegidos con datos completos
function almacenarInsumosElegidos(nombreInsumo, cantidadElegida) {

  //ASEGURAR TIPO
   cantidadElegida = Number(cantidadElegida) || 0;
  if (cantidadElegida <= 0) {
    alert('Cantidad inválida');
    return false;
  }



  // Obtener insumos ya guardados
  let insumosElegidos = getInsumosGuardados(); // usa tu helper

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
    const solicitadoExistente = Number(insumoCompleto.stockActual) - Number(almacenado.stockActual);

    const nuevoSolicitado = solicitadoExistente + cantidadElegida;

    if (nuevoSolicitado > stockOriginal) {
      alert(`No hay suficiente stock. Ya solicitaste ${solicitadoExistente} y pediste ${cantidadElegida}. Stock disponible total: ${stockOriginal}.`);
      return false;
    }


    
    // Actualizamos el stock restante guardado
    almacenado.stockActual = stockOriginal - nuevoSolicitado;

    // Por precaución, actualizamos otros campos por si cambiaron
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
      return false;}

      const nuevoRegistro = {
      categoria: insumoCompleto.categoria,
      critico: insumoCompleto.critico,
      idInsumo: insumoCompleto.idInsumo,
      nombre: insumoCompleto.nombre,
      // guardamos stock restante (como venías haciendo)
      stockActual: stockOriginal - cantidadElegida,
      stockMinimo: insumoCompleto.stockMinimo
    };

    insumosElegidos.push(nuevoRegistro);
    guardarInsumos(insumosElegidos);
    return true;
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
 // o el texto dinámico que quieras

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


let datoForm = JSON.parse(localStorage.getItem(STORAGE_KEY_FORM) || '{}');
modalCargaTramite.textContent = datoForm.numeroTramite || '';
modalCargaArea.textContent = datoForm.areaSolicitante || '';
modalCargaNombre.textContent = datoForm.nombreSolicitante || '';
modalCargaFecha.textContent = datoForm.fechaSolicitud || '';


const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nombre = selectInsumo.value;
  const cantidad = parseInt(inputCantidad.value);
  const insumoSeleccionado = insumos.find((i) => i.nombre === nombre);

  if (!nombre || !cantidad) {
    alert("Por favor completa todos los campos");
    return;
  }

  if (cantidad > insumoSeleccionado.stockActual) {
    alert("La cantidad supera el stock disponible");
    return;
  }

  modalNombre.textContent = nombre;
  modalCantidad.textContent = cantidad;

  modalConfirmacion.style.display = "flex";
});

btnCancelar.addEventListener("click", () => {
  modalConfirmacion.style.display = "none";
});


btnConfirmar.addEventListener("click", () => {
  const nombre = modalNombre.textContent;
  const cantidad = parseInt(modalCantidad.textContent);

  almacenarInsumosElegidos(nombre, cantidad);

  modalConfirmacion.style.display = "none";
  modalExito.style.display = "flex";

  inputCantidad.value = "";
  stockDiv.style.display = "none";
});

btnAgregarOtro.addEventListener("click", () => {
  modalExito.style.display = "none";
  selectInsumo.focus();
});

btnConfirmarListado.addEventListener("click", () => {
  modalExito.style.display = "none";
  mostrarModalConfirmacionCarga();
});

function mostrarModalConfirmacionCarga() {
  const formData = JSON.parse(localStorage.getItem(STORAGE_KEY_FORM)) || {};

  modalCargaTramite.textContent = formData.numero_tramite || '';
  modalCargaArea.textContent = formData.area || '';
  modalCargaNombre.textContent = formData.nombre_solicitante || '';
  modalCargaFecha.textContent = formData.fecha_solicitud
  || '';

  const fechaActual = new Date().toLocaleDateString("es-AR");
  document.getElementById("modal-carga-fecha").textContent = fechaActual;

  const insumosGuardados = getInsumosGuardados();
  const listaInsumos = document.getElementById("modal-carga-lista-insumos");
  listaInsumos.innerHTML = "";

  insumosGuardados.forEach((insumo) => {
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

document.getElementById("btn-cancelar-carga").addEventListener("click", () => {
  modalConfirmacionCarga.style.display = "none";
  modalExito.style.display = "flex"; 
});

document
  .getElementById("btn-confirmar-carga")
  .addEventListener("click", async () => {
    try {
      const formData = JSON.parse(localStorage.getItem(STORAGE_KEY_FORM)) || {};
      const insumosGuardados = getInsumosGuardados();

      const nroTramite = formData.numero_tramite || "1515/2025";
      const areaSolicitante = formData.area || "Posgrado";
      const nombreSolicitante = formData.nombre_solicitante || "Omar Luna";
      const fechaActual = formData.fecha_solicitud; 
      const estado = "Pendiente"; 

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
        const insumoOriginal = insumos.find(
          (orig) => orig.nombre === insumoGuardado.nombre
        );
        const cantidadSolicitada =
          insumoOriginal.stockActual - insumoGuardado.stockActual;

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

      localStorage.removeItem(STORAGE_KEY_INSUMOS);

      modalConfirmacionCarga.style.display = "none";
      modalExitoFinal.style.display = "flex";
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      alert("Error al procesar la solicitud: " + error.message);
    }
  });

document.getElementById("btn-continuar-final").addEventListener("click", () => {
  modalExitoFinal.style.display = "none";
  window.location.href = "cargar-nota.html";
});

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
