import { createInsumo } from "./services/InsumoService.js";

const categoriaSelect = document.getElementById("categoria");
const esCriticoSelect = document.getElementById("esCritico");
const stockMinimoContainer = document.getElementById("stockMinimoContainer");
const stockMinimoInput = document.getElementById("stockMinimo");
const form = document.querySelector("form");

// === Cargar categorías ===
function cargarCategorias() {
  const categorias = [
    "Limpieza",
    "Papelería",
    "Oficina",
    "Mantenimiento",
    "Informática",
  ];

  categoriaSelect.innerHTML = '<option value="">Seleccione una categoría</option>';
  categorias.forEach((nombre) => {
    const option = document.createElement("option");
    option.value = nombre;
    option.textContent = nombre;
    categoriaSelect.appendChild(option);
  });
}

// === Mostrar / ocultar stock mínimo ===
esCriticoSelect.addEventListener("change", (e) => {
  const esCritico = e.target.value === "1";
  stockMinimoContainer.classList.toggle("hidden", !esCritico);
  if (!esCritico) stockMinimoInput.value = "";
});

// === Enviar formulario ===
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = form.nombre_insumo.value.trim();
  const categoriaNombre = categoriaSelect.value;
  const cantidad = parseInt(form.cantidad.value);
  const critico = parseInt(esCriticoSelect.value); // 0 o 1
  const stockMinimo = critico === 1 ? parseInt(stockMinimoInput.value) || 0 : 0;

  if (!nombre || !categoriaNombre || !cantidad) {
    alert("⚠️ Por favor, complete todos los campos obligatorios.");
    return;
  }

  // 🔹 Objeto EXACTO que espera tu backend
  const nuevoInsumo = {
    nombre: nombre,
    categoria: categoriaNombre,
    stockActual: cantidad,
    stockMinimo: stockMinimo,
    critico: critico, // 0 o 1 (short)
  };

  console.log("🧾 Enviando insumo al backend:", nuevoInsumo);

  try {
    await createInsumo(nuevoInsumo);
    alert("✅ Insumo registrado correctamente.");
    form.reset();
    stockMinimoContainer.classList.add("hidden");
  } catch (error) {
    console.error("❌ Error al registrar insumo:", error);
    alert("No se pudo registrar el insumo. Revisá la consola.");
  }
});

// === Inicialización ===
document.addEventListener("DOMContentLoaded", cargarCategorias);
