import { createUsuario } from "./services/UsuarioService.js"; 
import { definirUsuario } from './services/usuarioEncabezado.js';

const form = document.querySelector("form");
const selectRol = document.getElementById("rol");
const popupExito = document.getElementById("popupExito");
const popupMensajeExito = document.getElementById("popupMensajeExito");
const btnCerrarExito = document.getElementById("btnCerrarExito");


const rolesEstaticos = ["administrador", "encargado", "no docente"];

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function cargarRoles() {
  selectRol.innerHTML =
    '<option value="">Seleccione un rol</option>' +
    rolesEstaticos
      .map(
        (rol) =>
          `<option value="${rol}">${capitalizar(rol)}</option>`
      )
      .join("");
}


function mostrarExito(mensaje) {
  popupMensajeExito.textContent = mensaje;
  popupExito.classList.remove("hidden");
}

btnCerrarExito.addEventListener("click", () => {
  popupExito.classList.add("hidden");
  window.location.href = "administrador.html";
});


form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const datos = Object.fromEntries(new FormData(form).entries());
  console.log("Datos del formulario:", datos);
  const nuevoUsuario = {
    dni: datos.dni,
    nombre: datos.nombre_apellido.trim(),
    correo: datos.correo.trim().toLowerCase(),
    contrasena: datos.contraseña.trim(),
    rol: datos.rol.toLowerCase()
  };
  console.log("Nuevo usuario a registrar:", nuevoUsuario);
  try {
    await createUsuario(nuevoUsuario);

    mostrarExito(`¡Usuario "${nuevoUsuario.nombre}" registrado correctamente!`);
    form.reset();
  } catch (error) {
    console.error("❌ Error al registrar usuario:", error);
  }
});


document.addEventListener("DOMContentLoaded", () => {
  cargarRoles();
  definirUsuario();
});
