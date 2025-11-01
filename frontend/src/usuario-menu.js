import { getInsumos, deleteInsumo, updateInsumo, getInsumoById } from "./services/InsumoService.js";
import { getUsuarioById, getUsuarios, updateUsuario } from "./services/UsuarioService.js";
import { registrarActividad } from "./services/actividadUtilidad";


     import { definirUsuario } from './services/usuarioEncabezado.js';

    document.addEventListener("DOMContentLoaded", () => {
        console.log('DOM cargado, ejecutando definirUsuario...');
        definirUsuario();
        cargarUsuarios();
    });
//

const popupAgregar = document.getElementById("popupAgregar");
const popupEliminar = document.getElementById("popupEliminar");
const popupExito = document.getElementById("popupExito");

const popupNombre = document.getElementById("popupNombre");
const popupCantidad = document.getElementById("popupCantidad");
const popupNombreEliminar = document.getElementById("popupNombreEliminar");
const popupMensajeExito = document.getElementById("popupMensajeExito");

const btnCancelarAgregar = document.getElementById("btnCancelarAgregar");
const btnConfirmarAgregar = document.getElementById("btnConfirmarEliminar");

const btnCerrarExito = document.getElementById("btnCerrarExito");

const usuarioActualRaw = localStorage.getItem('usuarioActual');
const usuarioActual = usuarioActualRaw ? Number(usuarioActualRaw) : null;


const buscador = document.getElementById("Buscar");
buscador.addEventListener("change", async (e) => {
  const termino = e.target.value.toLowerCase();
  if (termino.trim() !== "") {
    const usuarios = await getUsuarios();
    const filtrados = usuarios.filter(usuario => usuario.nombre.toLowerCase().includes(termino) && usuario.estado === 1);
    mostrarUsuarios(filtrados);
  }else{
    cargarUsuarios();
  }
});

function mostrarUsuarios(filtrados) {
  contenedor.innerHTML = "";
  if (filtrados.length === 0) {
    contenedor.innerHTML = '<p class="text-center text-gray-600 font-semibold">No se encontraron insumos.</p>';
    return;
  }
 //Este es el que muestra los insumos filtrados
  filtrados.forEach(insumo => {
    const div = document.createElement("div");
    div.className = "grid grid-cols-[2fr_1fr_auto] items-center py-2 border-b border-[#4D3C2D]";
    div.innerHTML = `
      <span class="font-medium text-[#4D3C2D]">${insumo.nombre}</span>
        <span class="text-center text-[#4D3C2D] font-semibold">${
          insumo.stockActual ?? 0
        }</span>
        <div class="flex justify-center gap-3">
          <img src="imgs/icon-delete.svg" class="w-5 h-5 cursor-pointer hover:scale-110 transition" title="Agregar cantidad" data-action="delete" data-id="${insumo.idInsumo}" data-nombre="${insumo.nombre}">
          <img src="imgs/icon-edit.svg" class="w-5 h-5 cursor-pointer hover:scale-110 transition" title="Editar" data-action="edit" data-id="${insumo.idInsumo}">
        </div>
        `;
    contenedor.appendChild(div);
  });
}

let usuarioSeleccionado = null;

const contenedor = document.getElementById("listaUsuarios");


async function cargarUsuarios() {
  contenedor.innerHTML = ""; 

  try {
    const usuarios = await getUsuarios();

    const header = document.createElement("div");
    header.className =
      "grid grid-cols-[2fr_1fr_auto] items-center font-extrabold text-[#4D3C2D] border-b-2 border-[#4D3C2D] pb-2 mb-2";
    header.innerHTML = `
      <span>Nombre</span>
      <span class="text-center">Rol</span>
      <span class="text-center">Acciones</span>
    `;
    contenedor.appendChild(header);

    usuarios.filter(usuario => usuario.estado == 1)
    .forEach((usuario) => {
      const row = document.createElement("div");
      row.className =
        "grid grid-cols-[2fr_1fr_auto] items-center py-2 border-b border-[#4D3C2D]";

      row.innerHTML = `
        <span class="font-medium text-[#4D3C2D]">${usuario.nombre}</span>
        <span class="text-center text-[#4D3C2D] font-semibold">${
          usuario.rol
        }</span>
        <div class="flex justify-center gap-3">
          <img src="imgs/icon-delete.svg" class="w-5 h-5 cursor-pointer hover:scale-110 transition" title="Dar de baja" data-action="delete" data-id="${usuario.idUsuario}" data-nombre="${usuario.nombre}">
          <img src="imgs/icon-edit.svg" class="w-5 h-5 cursor-pointer hover:scale-110 transition" title="Editar" data-action="edit" data-id="${usuario.idUsuario}">
        </div>
      `;

      contenedor.appendChild(row);
    });

    document.querySelectorAll("[data-action]").forEach((el) => {
      el.addEventListener("click", manejarAccion);
    });
  } catch (err) {
    console.error("Error al cargar Usuarios:", err);
    contenedor.innerHTML =
      '<p class="text-center text-red-600 font-semibold">No se pudieron cargar los insumos.</p>';
  }
}

function manejarAccion(e) {
  const action = e.target.dataset.action;
  const id = e.target.dataset.id;
  const nombre = e.target.dataset.nombre;

  usuarioSeleccionado = { idUsuario: Number(id), nombre };
  console.log("Usuario seleccionado:", usuarioSeleccionado.idUsuario, usuarioSeleccionado.nombre);

  if (action === "delete") {
    // abre popupEliminar y muestra nombre
    popupNombreEliminar.textContent = nombre;
    popupEliminar.classList.remove("hidden");
  } else if (action === "edit") {
    window.location.href = `usuario-modificar.html?id=${id}`;
  }
}



btnConfirmarAgregar.addEventListener("click", async () => {
  // si lo usás como 'confirmar baja' renombrar variable y flujo:
  try {
    const usuarioModificar = await getUsuarioById(usuarioSeleccionado.idUsuario);
    usuarioModificar.estado = 0;
    usuarioModificar.estadoNull = false;
    console.log(usuarioModificar);
    await updateUsuario(usuarioSeleccionado.idUsuario,usuarioModificar); // implementa en UsuarioService
    await registrarActividad(
      usuarioActual,
      "Baja de usuario",
      `Se dio de baja al usuario "${usuarioSeleccionado.nombre}"`,
      "Administración"
    );
    popupEliminar.classList.add("hidden"); 
    mostrarExito("Usuario dado de baja correctamente!");
    cargarUsuarios();
  } catch (err) {
    console.error("Error al dar de baja usuario:", err);
  }
});


btnCancelarAgregar.addEventListener("click", () => popupAgregar.classList.add("hidden"));
btnCancelarEliminar.addEventListener("click", () => popupEliminar.classList.add("hidden"));
btnCerrarExito.addEventListener("click", () => popupExito.classList.add("hidden"));

function mostrarExito(mensaje) {
  popupMensajeExito.textContent = mensaje;
  popupExito.classList.remove("hidden");
}

