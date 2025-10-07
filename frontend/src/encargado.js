import { getInsumos, deleteInsumo, updateInsumo, getInsumoById } from "./services/InsumoService.js";
import { registrarActividad } from "./services/actividadUtilidad";


//estetica
     import { definirUsuario } from './services/usuarioEncabezado.js';

    document.addEventListener("DOMContentLoaded", () => {
        console.log('DOM cargado, ejecutando definirUsuario...');
        definirUsuario();
    });
//

const popupAgregar = document.getElementById("popupAgregar");
const popupEliminar = document.getElementById("popupEliminar");
const popupExito = document.getElementById("popupExito");

const popupNombre = document.getElementById("popupNombre");
const popupCantidad = document.getElementById("popupCantidad");
const popupNombreEliminar = document.getElementById("popupNombreEliminar");
const popupMensajeExito = document.getElementById("popupMensajeExito");

// === Botones popups ===
const btnCancelarAgregar = document.getElementById("btnCancelarAgregar");
const btnConfirmarAgregar = document.getElementById("btnConfirmarAgregar");

const btnCerrarExito = document.getElementById("btnCerrarExito");

const usuarioActualRaw = localStorage.getItem('usuarioActual');
const usuarioActual = usuarioActualRaw ? Number(usuarioActualRaw) : null;
// Variable global para el insumo actual
let insumoSeleccionado = null;

const contenedor = document.getElementById("listaInsumos");


// ====================== CARGAR INSUMOS ======================
async function cargarInsumos() {
  contenedor.innerHTML = ""; // limpiar contenido

  try {
    const insumos = await getInsumos();

    // === Crear encabezado ===
    const header = document.createElement("div");
    header.className =
      "grid grid-cols-[2fr_1fr_auto] items-center font-extrabold text-[#4D3C2D] border-b-2 border-[#4D3C2D] pb-2 mb-2";
    header.innerHTML = `
      <span>Insumo</span>
      <span class="text-center">Cantidad</span>
      <span class="text-center">Acciones</span>
    `;
    contenedor.appendChild(header);

    // === Crear cada fila ===
    insumos.forEach((insumo) => {
      const row = document.createElement("div");
      row.className =
        "grid grid-cols-[2fr_1fr_auto] items-center py-2 border-b border-[#4D3C2D]";

      row.innerHTML = `
        <span class="font-medium text-[#4D3C2D]">${insumo.nombre}</span>
        <span class="text-center text-[#4D3C2D] font-semibold">${
          insumo.stockActual ?? 0
        }</span>
        <div class="flex justify-center gap-3">
          <img src="imgs/icon-add.svg" class="w-5 h-5 cursor-pointer hover:scale-110 transition" title="Agregar cantidad" data-action="add" data-id="${insumo.idInsumo}" data-nombre="${insumo.nombre}">
          <img src="imgs/icon-edit.svg" class="w-5 h-5 cursor-pointer hover:scale-110 transition" title="Editar" data-action="edit" data-id="${insumo.idInsumo}">
        </div>
      `;

      contenedor.appendChild(row);
    });

    // === Agregar listeners ===
    document.querySelectorAll("[data-action]").forEach((el) => {
      el.addEventListener("click", manejarAccion);
    });
  } catch (err) {
    console.error("Error al cargar insumos:", err);
    contenedor.innerHTML =
      '<p class="text-center text-red-600 font-semibold">No se pudieron cargar los insumos.</p>';
  }
}

function manejarAccion(e) {
  const action = e.target.dataset.action;
  const id = e.target.dataset.id;
  const nombre = e.target.dataset.nombre;

  // ✅ Guardar con el nombre correcto
  insumoSeleccionado = { idInsumo: Number(id), nombre };
  console.log("Insumo seleccionado:", insumoSeleccionado);

  if (action === "add") {
    popupNombre.value = nombre;
    popupCantidad.value = "";
    popupAgregar.classList.remove("hidden");
  } else if (action === "edit") {
    window.location.href = `modificar-insumo.html?id=${id}`;
  }
}


// === Agregar cantidad ===
btnConfirmarAgregar.addEventListener("click", async () => {
  const cantidad = parseInt(popupCantidad.value);
  if (!cantidad || cantidad <= 0) return;

  try {
    const insumoActual = await getInsumoById(insumoSeleccionado.id);
    const nuevoStock = insumoActual.stockActual + cantidad;
    await updateInsumo(insumoSeleccionado.id, { ...insumoActual, stockActual: nuevoStock });

    await registrarActividad(
      usuarioActual,
      "Actualización de cantidad",
      `Ingreso ${cantidad} unidades al insumo "${insumoSeleccionado.nombre}"`,
      "Depósito"
    );

    popupAgregar.classList.add("hidden");
    mostrarExito("¡Cantidad actualizada correctamente!");
    cargarInsumos();
  } catch (err) {
    console.error("Error al actualizar cantidad:", err);
  }
});

// === Botones de cierre ===
btnCancelarAgregar.addEventListener("click", () => popupAgregar.classList.add("hidden"));
btnCancelarEliminar.addEventListener("click", () => popupEliminar.classList.add("hidden"));
btnCerrarExito.addEventListener("click", () => popupExito.classList.add("hidden"));

function mostrarExito(mensaje) {
  popupMensajeExito.textContent = mensaje;
  popupExito.classList.remove("hidden");
}

document.addEventListener("DOMContentLoaded", cargarInsumos);
