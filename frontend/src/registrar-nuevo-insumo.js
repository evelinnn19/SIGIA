import { createInsumo, getInsumos, getUltimoInsumoId} from "./services/InsumoService.js";
import {createTransaccion} from "./services/TransaccionService.js"
import { registrarActividad } from "./services/actividadUtilidad";
import { getCategorias } from "./services/CategoriaService.js";


     import { definirUsuario } from './services/usuarioEncabezado.js';
import { alertasStockMinimo } from "./services/AlertasUtilidad.js";

    document.addEventListener("DOMContentLoaded", () => {
        console.log('DOM cargado, ejecutando definirUsuario...');
        definirUsuario();
        
    });
//




const categoriaSelect = document.getElementById("categoria");
const esCriticoSelect = document.getElementById("esCritico");
const stockMinimoContainer = document.getElementById("stockMinimoContainer");
const stockMinimoInput = document.getElementById("stockMinimo");
const form = document.querySelector("form");

const popupExito = document.getElementById("popupExito");
const popupMensajeExito = document.getElementById("popupMensajeExito");
const btnCerrarExito = document.getElementById("btnCerrarExito");

const btnCancelar = document.getElementById("btnCancelar");

btnCancelar.addEventListener('click', () => {
  window.history.back();
});


const usuarioActualRaw = localStorage.getItem('usuarioActual');
const usuarioActual = usuarioActualRaw ? Number(usuarioActualRaw) : null;
async function  cargarCategorias() {
    try {
    const categorias = await getCategorias();

    const categoriasActivas = categorias.filter(cat => cat.estado === 1);


    categoriaSelect.innerHTML = '<option value="">Seleccione una categoría</option>';

    categoriasActivas.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.nombre;
      option.textContent = cat.nombre;
      categoriaSelect.appendChild(option);
    });
  } catch (error) {
    console.error("❌ Error al cargar categorías:", error);
  }
}

esCriticoSelect.addEventListener("change", (e) => {
  const esCritico = e.target.value === "1";
  stockMinimoContainer.classList.toggle("hidden", !esCritico);
  if (!esCritico) stockMinimoInput.value = "";
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const insumosComprobar = await getInsumos();

const nombre = form.nombre_insumo.value.trim().toLowerCase();

if (insumosComprobar.find(insumo => insumo.nombre.trim().toLowerCase() === nombre)) {
  mostrarPopup("El insumo ya existe");
  return;
}
  const categoriaNombre = categoriaSelect.value;
  const cantidad = parseInt(form.cantidad.value);
  const critico = parseInt(esCriticoSelect.value); // 0 o 1
  const stockMinimo = critico === 1 ? parseInt(stockMinimoInput.value) || 0 : 0;

  if (!nombre || !categoriaNombre || !cantidad) {
    alert("⚠️ Por favor, complete todos los campos obligatorios.");
    return;
  }

  const nuevoInsumo = {
    nombre: nombre,
    categoria: categoriaNombre,
    stockActual: cantidad,
    stockMinimo: stockMinimo,
    critico: critico, 
  };

  console.log("🧾 Enviando insumo al backend:", nuevoInsumo);

  try {
    await createInsumo(nuevoInsumo);
    let ultimoinsumoid = await getUltimoInsumoId();
    let transaccion = {
      tipo : "Ingreso",
      fecha : new Date().toISOString().split('T')[0],
      cantidad: cantidad,
      areaDestino: "Depósito",
      solicitante: "--",
      idInsumo: ultimoinsumoid.idInsumo,
      idUsuario: usuarioActual
    }
    await createTransaccion(transaccion);
    console.log(transaccion);
    await registrarActividad(
    usuarioActual,
    "Ingreso",
    `Ingreso de "${nombre}" en categoría ${categoriaNombre}`,
    "Depósito"
  );
    mostrarPopup("✅ ¡Insumo registrado correctamente!");
    form.reset();
    stockMinimoContainer.classList.add("hidden");
  } catch (error) {
    console.error("❌ Error al registrar insumo:", error);
    mostrarPopup("❌ No se pudo registrar el insumo.");

  }

  
});



function mostrarPopup(mensaje) {
  popupMensajeExito.textContent = mensaje;
  popupExito.classList.remove("hidden");
}

btnCerrarExito.addEventListener("click", () => {
  popupExito.classList.add("hidden");
  window.location.href = "encargado.html";
});


document.addEventListener("DOMContentLoaded", cargarCategorias);
