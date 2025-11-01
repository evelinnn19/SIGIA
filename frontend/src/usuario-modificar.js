// src/usuario-modificar.js
import { getUsuarioById, updateUsuario } from "./services/UsuarioService.js";
import { definirUsuario } from "./services/usuarioEncabezado.js";
import { registrarActividad } from "./services/actividadUtilidad.js";

const form = document.querySelector("form");
const selectRol = document.getElementById("rol");
const popupExito = document.getElementById("popupExito");
const popupMensajeExito = document.getElementById("popupMensajeExito");
const btnCerrarExito = document.getElementById("btnCerrarExito");

const rolesEstaticos = ["administrador", "encargado", "no docente"];

let usuarioOriginal = null;
const params = new URLSearchParams(window.location.search);
const usuarioId = params.get("id");

function capitalizar(texto) {
  if (!texto) return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function cargarRoles() {
  selectRol.innerHTML =
    '<option value="">Seleccione un rol</option>' +
    rolesEstaticos
      .map((rol) => `<option value="${rol}">${capitalizar(rol)}</option>`)
      .join("");
}

function mostrarExito(mensaje) {
  popupMensajeExito.textContent = mensaje;
  popupExito.classList.remove("hidden");
}

btnCerrarExito.addEventListener("click", () => {
  popupExito.classList.add("hidden");
  // Volvemos al panel de administración al cerrar
  window.location.href = "administrador.html";
});

async function cargarUsuario() {
  if (!usuarioId) {
    console.error("No se recibió id de usuario en la URL");
    // opcional: redirigir o mostrar mensaje
    return;
  }

  try {
    const usuario = await getUsuarioById(usuarioId);
    usuarioOriginal = usuario; // guardo copia para mergear

    // Rellenar inputs (los name en el HTML)
    form.elements["nombre_apellido"].value = usuario.nombre ?? "";
    form.elements["dni"].value = usuario.dni ?? "";
    form.elements["correo"].value = usuario.correo ?? "";
    // nota: el campo contraseña lo dejamos vacío por seguridad
    form.elements["contraseña"].value = ""; // si el usuario pone algo se actualizará, si no se mantiene
    selectRol.value = usuario.rol ?? "";
    
    // Cambiar título y texto del botón para dejar claro que es edición
    const titulo = document.querySelector("h2");
    if (titulo) titulo.textContent = "Modificar Usuario";
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.textContent = "Guardar cambios";
  } catch (err) {
    console.error("Error al obtener usuario:", err);
    // opcional: mostrar feedback al usuario
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!usuarioOriginal) {
    console.error("No se cargó el usuario original. Abortando modificación.");
    return;
  }

  const datos = Object.fromEntries(new FormData(form).entries());
 
    const usuarioActualizado = {
    ...usuarioOriginal,
    dni: datos.dni,
    nombre: datos.nombre_apellido.trim(),
    correo: datos.correo.trim(), // se respeta el case original
    rol: datos.rol || usuarioOriginal.rol, // no hace falta toLowerCase()
    };


  // Si el usuario completó contraseña, la actualizo; si queda vacía, conservo la anterior
  if (datos.contraseña && datos.contraseña.trim().length > 0) {
    usuarioActualizado.contrasena = datos.contraseña.trim();
  } else {
    // Si tu backend usa otra propiedad para la pass, ajústalo aquí.
    // Simplemente dejamos la propiedad contrasena tal como vino en usuarioOriginal.
    usuarioActualizado.contrasena = usuarioOriginal.contrasena;
  }

  const submitBtn = form.querySelector('[type="submit"]');
submitBtn.disabled = true;

  try {
    await updateUsuario(usuarioId, usuarioActualizado);

    // Registrar actividad: obtengo usuarioActual desde localStorage si existe
    const usuarioActualRaw = localStorage.getItem("usuarioActual");
    const usuarioActual = usuarioActualRaw ? Number(usuarioActualRaw) : null;

    try {
      await registrarActividad(
        usuarioActual,
        "Modificación de usuario",
        `Se modificó al usuario "${usuarioActualizado.nombre}" (id: ${usuarioId})`,
        "Administración"
      );
    } catch (errActividad) {
      console.warn("No se pudo registrar la actividad:", errActividad);
    }finally {
  submitBtn.disabled = false;
}

    mostrarExito(`¡Usuario "${usuarioActualizado.nombre}" modificado correctamente!`);
  } catch (error) {
    console.error("❌ Error al actualizar usuario:", error);
    // opcional: mostrar un popup de error en la UI
    popupMensajeExito.textContent = "No se pudo guardar los cambios. Revisa la consola.";
    popupExito.classList.remove("hidden");
  }
});


const btnCancelar = document.querySelector('button[type="button"]');

btnCancelar.addEventListener("click", (e) => {
  e.preventDefault();
  // Podés redirigir a la lista de usuarios o al panel anterior
  window.location.href = "usuario-menu.html";
});

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
  cargarRoles();
  definirUsuario();
  cargarUsuario();
});
