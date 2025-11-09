// modificar-categoria.js
import { getCategoriaById, updateCategoria } from "./services/CategoriaService.js";
import { registrarActividad } from "./services/actividadUtilidad.js";
import { definirUsuario } from "./services/usuarioEncabezado.js";

const form = document.getElementById("formCategoria");
const inputNombre = document.getElementById("inputNombre");
const selectEstado = document.getElementById("selectEstado");
const btnCancelar = document.getElementById("btnCancelar");
const btnGuardar = document.getElementById("btnGuardar");

const popupExito = document.getElementById("popupExito");
const popupMensajeExito = document.getElementById("popupMensajeExito");
const btnCerrarExito = document.getElementById("btnCerrarExito");

const popupError = document.getElementById("popupError");
const popupMensajeError = document.getElementById("popupMensajeError");
const btnCerrarError = document.getElementById("btnCerrarError");

const usuarioActualRaw = localStorage.getItem("usuarioActual");
const usuarioActual = usuarioActualRaw ? Number(usuarioActualRaw) : null;

// obtener id de la URL
const params = new URLSearchParams(window.location.search);
const categoriaId = params.get("id"); // debe ser idCategoria

let categoriaOriginal = null;

function mostrarExito(mensaje) {
  popupMensajeExito.textContent = mensaje;
  popupExito.classList.remove("hidden");
}

function mostrarError(mensaje) {
  popupMensajeError.textContent = mensaje;
  popupError.classList.remove("hidden");
}

// cerrar popups
btnCerrarExito?.addEventListener("click", () => {
  popupExito.classList.add("hidden");
  // volver a la lista de categorias
  window.location.href = "categoria-menu.html";
});
btnCerrarError?.addEventListener("click", () => popupError.classList.add("hidden"));

// cancelar
btnCancelar?.addEventListener("click", (e) => {
  e.preventDefault();
  window.location.href = "categoria-menu.html";
});

// cargar categoria
async function cargarCategoria() {
  if (!categoriaId) {
    mostrarError("No se recibió el id de la categoría en la URL.");
    return;
  }

  try {
    const categoria = await getCategoriaById(categoriaId);
    if (!categoria) {
      mostrarError("Categoría no encontrada.");
      return;
    }

    categoriaOriginal = categoria;

    // rellenar campos (solo nombre y estado)
    inputNombre.value = categoria.nombre ?? "";
    // estado puede venir como number o string; normalizamos a "1"/"0"
    selectEstado.value = String(categoria.estado ?? 0);

    // cambiar título para claridad
    const titulo = document.getElementById("tituloPagina");
    if (titulo) titulo.textContent = `Modificar categoría: ${categoria.nombre ?? ""}`;

  } catch (err) {
    console.error("Error al cargar categoría:", err);
    mostrarError("No se pudo cargar la categoría. Revisa la consola del navegador.");
  }
}

// submit -> actualizar
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!categoriaOriginal) {
    mostrarError("No se cargó la categoría original. Recarga la página.");
    return;
  }

  const datos = Object.fromEntries(new FormData(form).entries());
  const nombreNuevo = (datos.nombre ?? "").trim();
  const estadoNuevo = Number(datos.estado); // 1 o 0

  if (!nombreNuevo) {
    mostrarError("El nombre no puede estar vacío.");
    return;
  }

  // Construir DTO a enviar: partimos de la original para no perder campos que el backend espere
  const categoriaActualizada = {
    ...categoriaOriginal,
    nombre: nombreNuevo,
    estado: estadoNuevo,
    // si tu DAO necesita un flag para indicar no-nulidad:
    estadoNull: false
  };

  // prevenir doble submit
  btnGuardar.disabled = true;

  try {
    await updateCategoria(categoriaId, categoriaActualizada);

    // registrar actividad (intento seguro)
    try {
      await registrarActividad(
        usuarioActual,
        "Modificación de categoría",
        `Se modificó la categoría "${categoriaOriginal.nombre}" -> "${nombreNuevo}" (id: ${categoriaId})`,
        "Administración"
      );
    } catch (errAct) {
      console.warn("No se pudo registrar la actividad:", errAct);
    }

    mostrarExito(`¡Categoría "${nombreNuevo}" modificada correctamente!`);
  } catch (err) {
    console.error("Error al actualizar categoría:", err);

    // Si la API devuelve info en err.body (según tu createCategoria), podés inspeccionarla:
    if (err && err.status === 409) {
      mostrarError(`La categoría "${nombreNuevo}" ya existe.`);
    } else {
      mostrarError("No se pudo guardar los cambios. Revisa la consola.");
    }
  } finally {
    btnGuardar.disabled = false;
  }
});

// inicialización
document.addEventListener("DOMContentLoaded", () => {
  definirUsuario();
  cargarCategoria();
});
