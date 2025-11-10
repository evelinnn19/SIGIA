import { createCategoria } from "./services/CategoriaService.js";
import { registrarActividad } from "./services/actividadUtilidad.js";
import { definirUsuario } from './services/usuarioEncabezado.js';

const form = document.querySelector("form");
const popupExito = document.getElementById("popupExito");
const popupMensajeExito = document.getElementById("popupMensajeExito");
const btnCerrarExito = document.getElementById("btnCerrarExito");

const usuarioActualRaw = localStorage.getItem('usuarioActual');
const usuarioActual = usuarioActualRaw ? Number(usuarioActualRaw) : null;


const btnCancelar = document.getElementById("btnCancelar");

// 🔹 Manejo del botón Cancelar
btnCancelar.addEventListener("click", (e) => {
  e.preventDefault(); // evita recargar la página
  form.reset(); // limpia los campos

  // si querés volver a la página anterior:
  window.location.href = "categoria-menu.html"});


function mostrarExito(mensaje) {
  popupMensajeExito.textContent = mensaje;
  popupExito.classList.remove("hidden");
}

btnCerrarExito.addEventListener("click", () => {
  popupExito.classList.add("hidden");
  window.location.href = "administrador.html";
});


const popupError = document.getElementById("popupError");
const popupMensajeError = document.getElementById("popupMensajeError");
const btnCerrarError = document.getElementById("btnCerrarError");

function mostrarError(mensaje) {
  popupMensajeError.textContent = mensaje;
  popupError.classList.remove("hidden");
}

btnCerrarError.addEventListener("click", () => {
  popupError.classList.add("hidden");
});



form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const datos = Object.fromEntries(new FormData(form).entries());
  console.log("Datos del formulario:", datos);
  const nuevaCategoria = {
    nombre: datos.nombre_categoria.trim(),
    estado: 1
  };
  console.log("Nuevo categoria a registrar:", nuevaCategoria);
  try {

    const nombreTrim = nuevaCategoria.nombre;
    if (await existeCategoria(nombreTrim)) {
    mostrarError(`La categoría "${nombreTrim}" ya existe.`);
    return; // no hacemos POST
    }
    await createCategoria(nuevaCategoria);
        await registrarActividad(
          usuarioActual,
          "Alta de categoria",
          `Se dio de alta a la categoria "${nuevaCategoria.nombre}"`,
          "Administración"
        );

    mostrarExito(`¡Categoria "${nuevaCategoria.nombre}" registrado correctamente!`);
    form.reset();
  } catch (error) {
      console.error("❌ Error al registrar categoria:", error);

  // Si el backend devolvió conflicto (409)
  if (error.message.includes("409") || error.message.includes("ya existe")) {
    mostrarError(`La categoría "${nuevaCategoria.nombre}" ya existe.`);
  } else {
    mostrarError("Ocurrió un error al registrar la categoría.");
  }
}});




// función simple para chequear existencia por nombre
async function existeCategoria(nombre) {
  const res = await fetch(`http://localhost:8080/api/categorias/nombre/${encodeURIComponent(nombre)}`);
  if (!res.ok) {
    // si el endpoint falla, asumimos que no existe para no bloquear; o lanzar error según prefieras
    return false;
  }
  const data = await res.json();
  // Si el endpoint devuelve un array (o categoría), comprobamos longitud
  return Array.isArray(data) ? data.length > 0 : (data != null && Object.keys(data).length > 0);
}

// en tu submit handler, antes de createCategoria:




document.addEventListener("DOMContentLoaded", () => {
  definirUsuario();
});
