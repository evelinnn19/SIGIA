import {getInsumos}  from "./services/InsumoService";

const insumos = await getInsumos();
console.log(insumos);




// // src/agregar-insumo.js
// // Script mejorado para agregar-insumo.html
const STORAGE_KEY_INSUMOS = 'sigia_insumos';
const STORAGE_KEY_FORM = 'sigia_form_cargar_nota';
const STORAGE_KEY_EDIT_INDEX = 'sigia_edit_index';




// // Elementos del DOM
//Mini formulario Nombre y cantidad
const selectInsumo = document.querySelector('select[name="nombre_insumo"]');
selectInsumo.innerHTML = '';
const inputCantidad = document.querySelector('input[name="cantidad"]');
inputCantidad.value = '';
const stockDiv = document.getElementById('stock-message');

// Limpiás el contenido anterior
stockDiv.innerHTML = '';

// Creás el <p> y lo configurás
const p = document.createElement('p');
p.setAttribute('class', 'text-[#B91C1C] text-sm font-bold');
p.textContent = 'no hay suficiente stock'; // o el texto dinámico que quieras

// Lo agregás al div
stockDiv.appendChild(p);

// Mostrás el div
stockDiv.style.display = 'block';


for (let insumo of insumos){
    let option = document.createElement('option');
    option.innerText = insumo.nombre;
    selectInsumo.appendChild(option);
}


//evento nuevo para cuando alguien seleccione algo
selectInsumo.addEventListener('change', () => {
  const insumoSeleccionado = insumos.find(i => i.nombre == selectInsumo.value);
  

  if (insumoSeleccionado) {
    stockDiv.textContent = `Stock disponible: ${insumoSeleccionado.stockActual}`;
  }
});


// Agrego evento cuando el usuario cambia la cantidad
inputCantidad.addEventListener('input', () => {
  const insumoSeleccionado = insumos.find(i => i.nombre == selectInsumo.value);
  stockDiv.textContent = ''; // limpio mensaje anterior

  if (insumoSeleccionado && inputCantidad.value > insumoSeleccionado.stockActual) {
    stockDiv.textContent = "Superaste la cantidad máxima disponible";
    stockDiv.style.color = "red";
  } else if (insumoSeleccionado) {
    stockDiv.textContent = `Stock disponible: ${insumoSeleccionado.stockActual}`;
    stockDiv.style.color = "inherit";
  }
});


const modalConfirmacion = document.getElementById('modal-confirmacion');
const modalExito = document.getElementById('modal-exito');
const modalConfirmacionCarga = document.getElementById('modal-confirmacion-carga');
const modalExitoFinal = document.getElementById('modal-exito-final');

const btnCancelar = document.getElementById('btn-cancelar');
const btnConfirmar = document.getElementById('btn-confirmar');
const btnAgregarOtro = document.getElementById('btn-agregar-otro');
const btnConfirmarListado = document.getElementById('btn-confirmar-listado');
const btnCancelarCarga = document.getElementById('btn-cancelar-carga');
const btnConfirmarCarga = document.getElementById('btn-confirmar-carga');
const btnContinuarFinal = document.getElementById('btn-continuar-final');

const modalNombre = document.getElementById('modal-nombre');
const modalCantidad = document.getElementById('modal-cantidad');

const modalCargaTramite = document.getElementById('modal-carga-tramite');
const modalCargaArea = document.getElementById('modal-carga-area');
const modalCargaNombre = document.getElementById('modal-carga-nombre');
const modalCargaFecha = document.getElementById('modal-carga-fecha');
const modalCargaListaInsumos = document.getElementById('modal-carga-lista-insumos');

const form = document.querySelector('form');

// // --- Helpers storage ---
// // function getInsumos() {
// //   try {
// //     return JSON.parse(sessionStorage.getItem(STORAGE_KEY_INSUMOS) || '[]');
// //   } catch (e) {
// //     console.warn('parse insumos', e);
// //     return [];
// //   }
// // }
// // function saveInsumos(arr) {
// //   sessionStorage.setItem(STORAGE_KEY_INSUMOS, JSON.stringify(arr));
// // }
// // function getDatosNota() {
// //   try {
// //     return JSON.parse(sessionStorage.getItem(STORAGE_KEY_FORM) || '{}');
// //   } catch (e) {
// //     return {};
// //   }
// // }
// // function clearEditIndex() {
// //   sessionStorage.removeItem(STORAGE_KEY_EDIT_INDEX);
// // }
// // function setEditIndex(i) {
// //   sessionStorage.setItem(STORAGE_KEY_EDIT_INDEX, String(i));
// // }
// // function getEditIndex() {
// //   const v = sessionStorage.getItem(STORAGE_KEY_EDIT_INDEX);
// //   return v === null ? null : parseInt(v, 10);
// // }

// // Formato DD/MM/YYYY
// function formatDateIsoToDDMMYYYY(iso) {
//   if (!iso) return 'DD/MM/YYYY';
//   // iso esperado: YYYY-MM-DD
//   const parts = iso.split('-');
//   if (parts.length !== 3) return iso;
//   return `${parts[2]}/${parts[1]}/${parts[0]}`;
// }

// // Stock check
// function verificarStock() {
//   const insumo = selectInsumo.value;
//   const cantidad = parseInt(inputCantidad.value) || 0;
//   const stock = stockDisponible[insumo] || 0;

//   if (stock > 0 && cantidad > stock) {
//     stockDiv.style.display = 'block';
//   } else {
//     stockDiv.style.display = 'none';
//   }
// }

// // --- Render lista dentro del modal de confirmación de carga ---
// function renderModalListaInsumos() {
//   const insumos = getInsumos();
//   modalCargaListaInsumos.innerHTML = '';

//   if (!insumos.length) {
//     modalCargaListaInsumos.innerHTML = `<p class="text-center text-sm text-[#8A9A7A]">No hay insumos en la lista.</p>`;
//     return;
//   }

//   insumos.forEach((ins, idx) => {
//     const insumoDiv = document.createElement('div');
//     insumoDiv.className = 'bg-[#F7EEC3] rounded-xl px-4 py-2.5 flex items-center justify-between gap-4';

//     insumoDiv.innerHTML = `
//       <div class="flex items-center gap-3">
//         <span class="font-bold text-[#4D3C2D]">${ins.cantidad}</span>
//         <span class="text-[#4D3C2D] text-sm">${ins.nombre}</span>
//       </div>
//       <div class="flex gap-2">
//         <button data-action="editar" data-index="${idx}" type="button" class="p-1" title="Editar">
//           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
//           </svg>
//         </button>
//         <button data-action="eliminar" data-index="${idx}" type="button" class="p-1" title="Eliminar">
//           <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
//           </svg>
//         </button>
//       </div>
//     `;
//     modalCargaListaInsumos.appendChild(insumoDiv);
//   });

//   // Delegación de eventos para botones editar/eliminar
//   modalCargaListaInsumos.querySelectorAll('button[data-action]').forEach(btn => {
//     btn.addEventListener('click', (e) => {
//       const action = btn.getAttribute('data-action');
//       const index = parseInt(btn.getAttribute('data-index'), 10);
//       if (action === 'editar') {
//         editarInsumoModal(index);
//       } else if (action === 'eliminar') {
//         eliminarInsumoModal(index);
//       }
//     });
//   });
// }

// // --- Funciones editar/eliminar accesibles ---
// function editarInsumoModal(index) {
//   const insumos = getInsumos();
//   if (!insumos[index]) return;
//   // Cargamos en el formulario y marcamos edit index
//   selectInsumo.value = insumos[index].nombre;
//   inputCantidad.value = insumos[index].cantidad;
//   verificarStock();
//   setEditIndex(index);
//   // Cerramos modal para que el usuario edite y confirme
//   modalConfirmacionCarga.style.display = 'none';
//   // poner foco en cantidad
//   inputCantidad.focus();
// }

// function eliminarInsumoModal(index) {
//   if (!confirm('¿Está seguro de eliminar este insumo?')) return;
//   const insumos = getInsumos();
//   insumos.splice(index, 1);
//   saveInsumos(insumos);
//   renderModalListaInsumos();
//   if (insumos.length === 0) {
//     modalConfirmacionCarga.style.display = 'none';
//     alert('No hay insumos en la lista');
//   }
// }

// // --- Eventos del formulario principal (Agregar) ---
// form.addEventListener('submit', (e) => {
//   e.preventDefault();

//   const insumo = selectInsumo.value;
//   const cantidad = parseInt(inputCantidad.value) || 0;
//   const stock = stockDisponible[insumo] || 0;

//   if (cantidad <= 0) {
//     alert('La cantidad debe ser mayor a 0');
//     return;
//   }
//   if (cantidad > stock) {
//     alert('No hay suficiente stock disponible');
//     return;
//   }

//   // Mostrar modal de confirmación con los datos
//   modalNombre.textContent = insumo;
//   modalCantidad.textContent = cantidad;
//   modalConfirmacion.style.display = 'flex';
// });

// // Cancelar modal confirmación
// btnCancelar.addEventListener('click', () => {
//   modalConfirmacion.style.display = 'none';
// });

// // Confirmar - Guardar insumo (o editar si viene índice)
// btnConfirmar.addEventListener('click', () => {
//   const insumo = selectInsumo.value;
//   const cantidad = parseInt(inputCantidad.value) || 0;

//   let insumos = getInsumos();
//   const editIndex = getEditIndex();

//   if (editIndex !== null && !isNaN(editIndex)) {
//     // editar
//     if (!insumos[editIndex]) {
//       // índice inválido: fallback a push
//       insumos.push({ nombre: insumo, cantidad });
//     } else {
//       insumos[editIndex] = { nombre: insumo, cantidad };
//     }
//     clearEditIndex();
//   } else {
//     // nuevo
//     insumos.push({ nombre: insumo, cantidad });
//   }

//   saveInsumos(insumos);

//   modalConfirmacion.style.display = 'none';
//   modalExito.style.display = 'flex';
// });

// // Agregar otro
// btnAgregarOtro.addEventListener('click', () => {
//   modalExito.style.display = 'none';
//   form.reset();
//   // valores por defecto opcionales
//   selectInsumo.value = 'Resma A4';
//   inputCantidad.value = '2';
//   verificarStock();
//   clearEditIndex();
//   // mantener select visible etc.
// });

// // Confirmar listado -> abrir modal de carga con datos y la lista
// btnConfirmarListado.addEventListener('click', () => {
//   const insumos = getInsumos();
//   if (!insumos.length) {
//     alert('Debe agregar al menos un insumo');
//     return;
//   }

//   // Cargar datos de la nota
//   const datosNota = getDatosNota();
//   modalCargaTramite.textContent = datosNota.numero_tramite || datosNota.tramite || '—';
//   modalCargaArea.textContent = datosNota.area || '—';
//   modalCargaNombre.textContent = datosNota.nombre_solicitante || datosNota.nombre || '—';
//   // fecha: usar fecha_solicitud si existe
//   const fechaIso = datosNota.fecha_solicitud || datosNota.fecha || '';
//   modalCargaFecha.textContent = formatDateIsoToDDMMYYYY(fechaIso);

//   // Render lista dentro del modal de carga
//   renderModalListaInsumos();

//   modalExito.style.display = 'none';
//   modalConfirmacionCarga.style.display = 'flex';
// });

// // Cancelar modal de carga
// btnCancelarCarga.addEventListener('click', () => {
//   modalConfirmacionCarga.style.display = 'none';
// });

// // Confirmar carga - (aquí harías POST a la API)
// btnConfirmarCarga.addEventListener('click', async () => {
//   // Ejemplo: crear payload
//   const datosNota = getDatosNota();
//   const insumos = getInsumos();

//   const payload = {
//     numero_tramite: datosNota.numero_tramite || datosNota.tramite || '',
//     area: datosNota.area || '',
//     nombre_solicitante: datosNota.nombre_solicitante || datosNota.nombre || '',
//     fecha_solicitud: datosNota.fecha_solicitud || datosNota.fecha || '',
//     insumos
//   };

//   // ------------------------------
//   // Aquí podrías hacer fetch POST a tu backend, por ejemplo:
//   // await fetch('/api/notas', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
//   // .then(...)
//   // .catch(...)
//   // Para este ejemplo solo simulamos éxito.
//   // ------------------------------

//   // Simular éxito:
//   modalConfirmacionCarga.style.display = 'none';
//   modalExitoFinal.style.display = 'flex';
// });

// // Continuar final: limpiar y volver a cargar-nota.html
// btnContinuarFinal.addEventListener('click', () => {
//   // Limpiar datos temporales
//   sessionStorage.removeItem(STORAGE_KEY_INSUMOS);
//   sessionStorage.removeItem(STORAGE_KEY_FORM);
//   clearEditIndex();
//   modalExitoFinal.style.display = 'none';
//   // Redirigir a cargar-nota
//   window.location.href = 'cargar-nota.html';
// });

// // Cerrar modales al hacer click fuera
// [modalConfirmacion, modalExito, modalConfirmacionCarga, modalExitoFinal].forEach(modal => {
//   modal.addEventListener('click', function(e) {
//     if (e.target === this) {
//       this.style.display = 'none';
//     }
//   });
// });

// // Eventos para verificar stock en tiempo real
// selectInsumo.addEventListener('change', verificarStock);
// inputCantidad.addEventListener('input', verificarStock);
// verificarStock();

// // Si llegamos con edit index (viene desde cargar-nota -> Edit), precargamos el formulario
// (function initFromEditIndex() {
//   const idx = getEditIndex();
//   if (idx === null) return;
//   const insumos = getInsumos();
//   if (!insumos[idx]) {
//     clearEditIndex();
//     return;
//   }
//   selectInsumo.value = insumos[idx].nombre;
//   inputCantidad.value = insumos[idx].cantidad;
//   verificarStock();
//   // Dejamos el editIndex hasta que confirmen para que el botón Confirmar sepa que debe editar.
// })();

// // Exponer funciones (útiles para debug)
// window._sigia_agregar_insumo = {
//   getInsumos, saveInsumos, editarInsumoModal, eliminarInsumoModal, renderModalListaInsumos
// };
