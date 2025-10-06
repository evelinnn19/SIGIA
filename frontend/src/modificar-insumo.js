import { getInsumoById, updateInsumo } from "./services/InsumoService.js";

const form = document.querySelector("form");
const nombreInput = document.getElementById("nombre_insumo");
const categoriaSelect = document.getElementById("categoria");
const cantidadInput = document.querySelector("input[name='cantidad']");
const esCriticoSelect = document.getElementById("esCritico");
const stockMinimoInput = document.getElementById("stockMinimo");
const stockMinimoContainer = document.getElementById("stockMinimoContainer");

// Popups
const popupExito = document.getElementById("popupExito");
const popupMensajeExito = document.getElementById("popupMensajeExito");
const btnCerrarExito = document.getElementById("btnCerrarExito");

// === 1️⃣ Obtener ID del insumo desde la URL ===
const params = new URLSearchParams(window.location.search);
const insumoId = params.get("id");

// === 2️⃣ Cargar categorías ===
function cargarCategorias() {
  const categorias = ["Limpieza", "Papelería", "Oficina", "Mantenimiento", "Informática"];
  categorias.forEach((nombre) => {
    const option = document.createElement("option");
    option.value = nombre;
    option.textContent = nombre;
    categoriaSelect.appendChild(option);
  });
}

// === 3️⃣ Cargar datos del insumo ===
async function cargarInsumo() {
  try {
    const insumo = await getInsumoById(insumoId);

    nombreInput.value = insumo.nombre;
    categoriaSelect.value = insumo.categoria;
    cantidadInput.value = insumo.stockActual;
    esCriticoSelect.value = insumo.critico;
    esCriticoSelect.disabled = true; 

    if (insumo.critico === 1) {
      stockMinimoContainer.classList.remove("hidden");
      stockMinimoInput.value = insumo.stockMinimo;
    }
  } catch (error) {
    console.error("Error al cargar insumo:", error);
    mostrarPopup("❌ No se pudo cargar el insumo.");
  }
}

// === 4️⃣ Enviar actualización ===
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const categoria = categoriaSelect.value;
  const cantidad = parseInt(cantidadInput.value);
  const stockMinimo = parseInt(stockMinimoInput.value) || 0;

  if (!categoria || !cantidad) {
    mostrarPopup("⚠️ Complete todos los campos obligatorios.");
    return;
  }

  const insumoActualizado = {
  idInsumo: parseInt(insumoId),
  nombre: nombreInput.value,        // lo enviamos igual aunque sea readonly
  categoria: categoria,
  stockActual: parseInt(cantidad),
  stockMinimo: parseInt(stockMinimo),
  critico: parseInt(esCriticoSelect.value), // 0 o 1
};
  

  try {
    await updateInsumo(insumoId, insumoActualizado);
    mostrarPopup("¡Insumo modificado correctamente!");
  } catch (error) {
    console.error("Error al modificar insumo:", error);
    mostrarPopup("No se pudo modificar el insumo.");
  }
});

// === 5️⃣ Popup ===
function mostrarPopup(mensaje) {
  popupMensajeExito.textContent = mensaje;
  popupExito.classList.remove("hidden");
}

btnCerrarExito.addEventListener("click", () => {
  popupExito.classList.add("hidden");
  window.location.href = "encargado.html";
});

// === Inicialización ===
document.addEventListener("DOMContentLoaded", () => {
  cargarCategorias();
  cargarInsumo();
});
