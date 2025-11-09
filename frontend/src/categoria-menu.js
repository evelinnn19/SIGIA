// categoria-menu.js
import { getCategoriaById, getCategorias, updateCategoria } from "./services/CategoriaService.js";
import { registrarActividad } from "./services/actividadUtilidad.js";
import { definirUsuario } from "./services/usuarioEncabezado.js";

// al cargar el DOM, además de definirUsuario, forzamos el filtro inicial a "1"
document.addEventListener("DOMContentLoaded", () => {
  definirUsuario();
  // asegurar que el select exista y tenga por defecto "1"
  if (FiltroCategoria) FiltroCategoria.value = "1";
  cargarCategorias();
});


// --- Elementos del DOM ---
const contenedor = document.getElementById("listaInsumos");

const buscador = document.getElementById("Buscar");
const FiltroCategoria = document.getElementById("FiltroCategoria");

// popups y botones
const popupAgregar = document.getElementById("popupAgregar");
const popupEliminar = document.getElementById("popupEliminar");
const popupExito = document.getElementById("popupExito");

const popupNombre = document.getElementById("popupNombre");
const popupCantidad = document.getElementById("popupCantidad");
const popupNombreEliminar = document.getElementById("popupNombreEliminar");
const popupMensajeExito = document.getElementById("popupMensajeExito");

const btnCancelarAgregar = document.getElementById("btnCancelarAgregar");
const btnConfirmarAgregar = document.getElementById("btnConfirmarAgregar");

const btnCancelarEliminar = document.getElementById("btnCancelarEliminar");
const btnConfirmarEliminar = document.getElementById("btnConfirmarEliminar");

const btnCerrarExito = document.getElementById("btnCerrarExito");

const usuarioActualRaw = localStorage.getItem("usuarioActual");
const usuarioActual = usuarioActualRaw ? Number(usuarioActualRaw) : null;

// estado local
let categoriaSeleccionada = null;
let todasCategoriasCache = []; // cache para búsquedas rápidas

// --- Funciones de UI ---
function mostrarExito(mensaje) {
  popupMensajeExito.textContent = mensaje;
  popupExito.classList.remove("hidden");
}

function mostrarError(mensaje) {
  // Reusa popupExito para simplicidad o crear otro popup si querés
  popupMensajeExito.textContent = mensaje;
  popupExito.classList.remove("hidden");
}

// cerrar popups
btnCerrarExito?.addEventListener("click", () => popupExito.classList.add("hidden"));
btnCancelarAgregar?.addEventListener("click", () => popupAgregar.classList.add("hidden"));
btnCancelarEliminar?.addEventListener("click", () => popupEliminar.classList.add("hidden"));

// --- Búsqueda y filtro ---
buscador?.addEventListener("input", async (e) => {
  const termino = e.target.value.toLowerCase().trim();
  const filtroValor = FiltroCategoria?.value; // "1" o "0"

  let filtrados = todasCategoriasCache.slice();

  if (termino !== "") {
    filtrados = filtrados.filter(c => (c.nombre || "").toLowerCase().includes(termino));
  }

  if (filtroValor === "1" || filtroValor === "0") {
    filtrados = filtrados.filter(c => String((c.estado ?? 0)) === filtroValor);
  }

  mostrarCategorias(filtrados);
});



FiltroCategoria?.addEventListener("change", async (e) => {
  const valor = e.target.value; // "1" o "0"
  const termino = buscador.value.toLowerCase().trim();

  let filtrados = todasCategoriasCache.slice();

  if (termino !== "") {
    filtrados = filtrados.filter(c => (c.nombre || "").toLowerCase().includes(termino));
  }

  if (valor === "1" || valor === "0") {
    filtrados = filtrados.filter(c => String((c.estado ?? 0)) === valor);
  }

  mostrarCategorias(filtrados);
});


// --- Renderizado ---
function crearHeader() {
  const header = document.createElement("div");
  header.className =
    "grid grid-cols-[2fr_1fr_1fr_auto] items-center font-extrabold text-[#4D3C2D] border-b-2 border-[#4D3C2D] pb-2 mb-2";
  header.innerHTML = `
    <span class="text-center">Nombre</span>
    <span class="text-center">Estado</span>
    <span class="text-center">Acciones</span>
  `;
  return header;
}

function mostrarCategorias(categorias) {
  contenedor.innerHTML = "";

  if (!Array.isArray(categorias) || categorias.length === 0) {
    contenedor.innerHTML = '<p class="text-center text-gray-600 font-semibold">No se encontraron categorías</p>';
    return;
  }

  contenedor.appendChild(crearHeader());

  // construir filas
  categorias.forEach(categoria => {
    const div = document.createElement("div");
    div.className = "grid grid-cols-[2fr_1fr_1fr_auto] items-center py-2 border-b border-[#4D3C2D]";

    // Asegurarnos de usar el id correcto: idCategoria
    const id = categoria.idCategoria ?? categoria.idCategori ?? categoria.id ?? "";

    div.innerHTML = `
      <span class="font-medium text-[#4D3C2D]">${categoria.nombre ?? ""}</span>

      <span class="text-center text-[#4D3C2D] font-semibold">
        ${(categoria.estado ?? 0) === 1 ? "Activa" : "Inactiva"}
      </span>

      <div class="flex justify-center gap-3">
        <img src="imgs/icon-delete.svg" class="w-5 h-5 cursor-pointer hover:scale-110 transition" title="Dar de baja"
          data-action="delete" data-id="${id}" data-nombre="${categoria.nombre ?? ""}">
        <img src="/imgs/icon-edit.svg" alt="Editar" class="w-5 h-5 cursor-pointer hover:scale-110 transition" title="Editar"
          data-action="edit" data-id="${id}">
      </div>
    `;

    contenedor.appendChild(div);
  });

  // Agregar listeners después de insertar todo para evitar re-attach repetido
  document.querySelectorAll("[data-action]").forEach(el => {
    el.removeEventListener("click", manejarAccion); // quitar por si acaso
    el.addEventListener("click", manejarAccion);
  });
}

// --- Carga inicial ---
// Carga inicial: guardamos en cache y mostramos sólo las activas por defecto
async function cargarCategorias() {
  contenedor.innerHTML = ""; // limpieza

  try {
    const categorias = await getCategorias();
    todasCategoriasCache = Array.isArray(categorias) ? categorias : (categorias ? [categorias] : []);

    // Mostrar solo activas por defecto (estado === 1)
    const inicial = todasCategoriasCache.filter(c => (c.estado ?? 0) === 1);
    mostrarCategorias(inicial);
  } catch (err) {
    console.error("Error al cargar categorias:", err);
    contenedor.innerHTML =
      '<p class="text-center text-red-600 font-semibold">No se pudieron cargar las categorías.</p>';
  }
}


// --- Manejo de acciones ---
function manejarAccion(e) {
  const el = e.currentTarget || e.target;
  const action = el.dataset.action;
  const idRaw = el.dataset.id;
  const nombre = el.dataset.nombre ?? "";

  const id = idRaw ? Number(idRaw) : null;
  categoriaSeleccionada = { idCategoria: id, nombre };

  console.log("categoria seleccionada:", categoriaSeleccionada);

  if (action === "add") {
    // si usás popupAgregar para otra cosa
    popupNombre.value = nombre;
    popupCantidad.value = "";
    popupAgregar.classList.remove("hidden");
  } else if (action === "edit") {
    // redirigir a página de edición
    if (id) {
      window.location.href = `modificar-categoria.html?id=${id}`;
    }
  } else if (action === "delete") {
    // abrir modal de confirmación de baja
    popupNombreEliminar.textContent = nombre;
    popupEliminar.classList.remove("hidden");
  }
}

// --- Confirmar baja (dar estado = 0) ---
btnConfirmarEliminar?.addEventListener("click", async () => {
  if (!categoriaSeleccionada || !categoriaSeleccionada.idCategoria) {
    mostrarError("No hay categoría seleccionada.");
    return;
  }

  try {
    // obtener DTO actual
    const categoriaModificar = await getCategoriaById(categoriaSeleccionada.idCategoria);

    // actualizar estado
    categoriaModificar.estado = 0;
    // si tu DTO necesita flag para indicar que no es null:
    categoriaModificar.estadoNull = false;

    await updateCategoria(categoriaSeleccionada.idCategoria, categoriaModificar);

    await registrarActividad(
      usuarioActual,
      "Baja de categoria",
      `Se dio de baja a la categoria "${categoriaSeleccionada.nombre}"`,
      "Administración"
    );

    popupEliminar.classList.add("hidden");
    mostrarExito("Categoría dada de baja correctamente!");
    // recargar lista
    await cargarCategorias();
  } catch (err) {
    console.error("Error al dar de baja categoria:", err);
    mostrarError("No se pudo dar de baja la categoría.");
  }
});
