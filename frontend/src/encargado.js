import { getInsumos, deleteInsumo, updateInsumo, getInsumoById } from "./services/InsumoService.js";
import { registrarActividad } from "./services/actividadUtilidad";
import { getCategorias } from "./services/CategoriaService.js";
import { alertasStockMinimo } from "./services/AlertasUtilidad.js";

     import { definirUsuario } from './services/usuarioEncabezado.js';

    document.addEventListener("DOMContentLoaded", () => {
        console.log('DOM cargado, ejecutando definirUsuario...');
        definirUsuario();
        cargarCategorias();
        cargarInsumos();
        alertas();
    });
//

async function alertas() {
  await alertasStockMinimo();
}


const popupAgregar = document.getElementById("popupAgregar");
const popupEliminar = document.getElementById("popupEliminar");
const popupExito = document.getElementById("popupExito");

const popupNombre = document.getElementById("popupNombre");
const popupCantidad = document.getElementById("popupCantidad");
const popupNombreEliminar = document.getElementById("popupNombreEliminar");
const popupMensajeExito = document.getElementById("popupMensajeExito");

const btnCancelarAgregar = document.getElementById("btnCancelarAgregar");
const btnConfirmarAgregar = document.getElementById("btnConfirmarAgregar");

const btnCerrarExito = document.getElementById("btnCerrarExito");

const usuarioActualRaw = localStorage.getItem('usuarioActual');
const usuarioActual = usuarioActualRaw ? Number(usuarioActualRaw) : null;


const buscador = document.getElementById("Buscar");
const FiltroCategoria = document.getElementById("FiltroCategoria")
buscador.addEventListener("change", async (e) => {
  const termino = e.target.value.toLowerCase();
  if (termino.trim() !== "") {
    const insumos = await getInsumos();
    const filtrados = insumos.filter(insumo => insumo.nombre.toLowerCase().includes(termino));
    mostrarInsumos(filtrados);
  }else{
    cargarInsumos();
  }
});

FiltroCategoria.addEventListener("change", async (e) => {
  const categoria = e.target.value;
  const termino = buscador.value.toLowerCase().trim();
  const insumos = await getInsumos();

  let filtrados = insumos;

  // Filtra por nombre si hay texto
  if (termino !== "") {
    filtrados = filtrados.filter(insumo => 
      insumo.nombre.toLowerCase().includes(termino)
    );
  }

  // Filtra por categoría si se seleccionó una
  if (categoria !== "") {
    filtrados = filtrados.filter(insumo => insumo.categoria === categoria);
  }

  mostrarInsumos(filtrados);
});


function mostrarInsumos(filtrados) {
  contenedor.innerHTML = "";
  if (filtrados.length === 0) {
    contenedor.innerHTML = '<p class="text-center text-gray-600 font-semibold">No se encontraron insumos.</p>';
    return;
  }
 //Este es el que muestra los insumos filtrados
  const header = document.createElement("div");
header.className =
  "grid grid-cols-[2fr_1fr_1fr_auto] items-center font-extrabold text-[#4D3C2D] border-b-2 border-[#4D3C2D] pb-2 mb-2";
header.innerHTML = `
  <span>Insumo</span>
  <span class="text-center">Cantidad</span>
  <span class="text-center">Categoría</span>
  <span class="text-center">Acciones</span>
`;
contenedor.appendChild(header);

// Filas de insumos
filtrados.forEach(insumo => {
  const div = document.createElement("div");
  div.className = "grid grid-cols-[2fr_1fr_1fr_auto] items-center py-2 border-b border-[#4D3C2D]";

  div.innerHTML = `
    <span class="font-medium text-[#4D3C2D]">${insumo.nombre}</span>

    <span class="text-center text-[#4D3C2D] font-semibold">
      ${insumo.stockActual ?? 0}
    </span>

    <div class="flex justify-center">
      <span class="px-3 py-1 text-xs bg-[#DCE0B9] rounded-full font-medium">
        ${insumo.categoria ?? "Sin categoría"}
      </span>
    </div>

    <div class="flex justify-center gap-3">
      <img src="/imgs/icon-add.svg" alt="Agregar" class="w-5 h-5 cursor-pointer hover:scale-110 transition" title="Agregar cantidad" data-action="add" data-id="${insumo.idInsumo}" data-nombre="${insumo.nombre}">
      <img src="/imgs/icon-edit.svg" alt="Editar" class="w-5 h-5 cursor-pointer hover:scale-110 transition" title="Editar" data-action="edit" data-id="${insumo.idInsumo}">
    </div>
  `;

  contenedor.appendChild(div);

   document.querySelectorAll("[data-action]").forEach((el) => {
      el.addEventListener("click", manejarAccion);
    });
  
});
}

let insumoSeleccionado = null;

const contenedor = document.getElementById("listaInsumos");


async function cargarInsumos() {
  contenedor.innerHTML = ""; 

  try {
    const insumos = await getInsumos();

    const header = document.createElement("div");
header.className =
  "grid grid-cols-[2fr_1fr_1fr_auto] items-center font-extrabold text-[#4D3C2D] border-b-2 border-[#4D3C2D] pb-2 mb-2";
header.innerHTML = `
  <span>Insumo</span>
  <span class="text-center">Cantidad</span>
  <span class="text-center">Categoría</span>
  <span class="text-center">Acciones</span>
`;
contenedor.appendChild(header);

// Filas de insumos
insumos.forEach((insumo) => {
  const row = document.createElement("div");
  row.className =
    "grid grid-cols-[2fr_1fr_1fr_auto] items-center py-2 border-b border-[#4D3C2D]";

  row.innerHTML = `
    <span class="font-medium text-[#4D3C2D]">${insumo.nombre}</span>

    <span class="text-center text-[#4D3C2D] font-semibold">
      ${insumo.stockActual ?? 0}
    </span>

    <div class="flex justify-center">
      <span class="px-3 py-1 text-xs bg-[#DCE0B9] rounded-full font-medium">
        ${insumo.categoria ?? "Sin categoría"}
      </span>
    </div>

    <div class="flex justify-center gap-3">
      <img src="/imgs/icon-add.svg" alt="Agregar" class="w-5 h-5 cursor-pointer hover:scale-110 transition" title="Agregar cantidad" data-action="add" data-id="${insumo.idInsumo}" data-nombre="${insumo.nombre}">
      <img src="/imgs/icon-edit.svg" alt="Editar" class="w-5 h-5 cursor-pointer hover:scale-110 transition" title="Editar" data-action="edit" data-id="${insumo.idInsumo}">
    </div>
  `;

  contenedor.appendChild(row);
});

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

  insumoSeleccionado = { idInsumo: Number(id), nombre };
  console.log("Insumo seleccionado:", insumoSeleccionado.idInsumo, insumoSeleccionado.nombre);

  if (action === "add") {
    popupNombre.value = nombre;
    popupCantidad.value = "";
    popupAgregar.classList.remove("hidden");
  } else if (action === "edit") {
    window.location.href = `modificar-insumo.html?id=${id}`;
  }
}


async function  cargarCategorias() {
    try {
    const categorias = await getCategorias();

    const categoriasActivas = categorias.filter(cat => cat.estado === 1);


    FiltroCategoria.innerHTML = '<option value="">Seleccione una categoría</option>';

    categoriasActivas.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.nombre;
      option.textContent = cat.nombre;
      FiltroCategoria.appendChild(option);
    });
  } catch (error) {
    console.error("❌ Error al cargar categorías:", error);
  }
}



btnConfirmarAgregar.addEventListener("click", async () => {
  const cantidad = parseInt(popupCantidad.value);
  if (!cantidad || cantidad <= 0) return;

  try {
    const insumoActual = await getInsumoById(insumoSeleccionado.idInsumo);
    const nuevoStock = insumoActual.stockActual + cantidad;
    await updateInsumo(insumoSeleccionado.idInsumo, { ...insumoActual, stockActual: nuevoStock });

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

btnCancelarAgregar.addEventListener("click", () => popupAgregar.classList.add("hidden"));
btnCancelarEliminar.addEventListener("click", () => popupEliminar.classList.add("hidden"));
btnCerrarExito.addEventListener("click", () => popupExito.classList.add("hidden"));

function mostrarExito(mensaje) {
  popupMensajeExito.textContent = mensaje;
  popupExito.classList.remove("hidden");
}
