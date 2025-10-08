import {
  getSolicitudes,
  updateEstadoSolicitud,
} from "./services/SolicitudServices"; 
import { registrarActividad } from "./services/actividadUtilidad";

     import { definirUsuario } from './services/usuarioEncabezado.js';

    document.addEventListener("DOMContentLoaded", () => {
        console.log('DOM cargado, ejecutando definirUsuario...');
        definirUsuario();
    });

const usuarioActualRaw = localStorage.getItem("usuarioActual");
const usuarioActual = usuarioActualRaw ? Number(usuarioActualRaw) : null;

const ESTADOS = [
  "Pendiente",
  "Aprobada",
  "Rechazada",
  "Entregada", 
  "Cancelada",
  "Entregado parcialmente",
];


function renderSolicitudes(lista) {
  const cont = document.getElementById("filas");
  if (!cont) {
    console.warn("#filas no encontrado en el DOM");
    return;
  }

  cont.innerHTML = ""; 
  if (!Array.isArray(lista) || lista.length === 0) {
    cont.innerHTML = `<div class="px-2 text-sm text-[#4D3C2D]">No hay trámites.</div>`;
    return;
  }
  const fragment = document.createDocumentFragment();
  lista.forEach((tramite) => {
    fragment.appendChild(crearFila(tramite));
  });
  cont.appendChild(fragment);
}

function attachEvents() {
  const cont = document.getElementById("filas");
  if (!cont) {
    console.warn("attachEvents: contenedor #filas no existe");
    return;
  }

  cont.addEventListener("change", async (e) => {
    const target = e.target;
    if (target.tagName.toLowerCase() === "select") {
      const nuevoEstado =
        target.value.charAt(0).toUpperCase() + target.value.slice(1);
      const id = target.dataset.id;
      console.log("Actualizar estado", id, nuevoEstado);
      target.disabled = true;
      try {
        await updateEstadoSolicitud(id, nuevoEstado);
        console.log("Estado actualizado OK");
        await registrarActividad(
          usuarioActual,
          "Cambio de estado en solicitud",
          `Cambio a ${nuevoEstado} en IDSolicitud ${id}`, 
          "--"
        );
      } catch (err) {
        console.error("No se pudo actualizar estado:", err);
      } finally {
        target.disabled = false;
      }
    }
  });
}

async function initTabla() {
  attachEvents();
  try {
    const solicitudes = await getSolicitudes();
    console.log("Solicitudes obtenidas:", solicitudes);
    renderSolicitudes(solicitudes);
  } catch (err) {
    console.error("Error cargando solicitudes:", err);
    const cont = document.getElementById("filas");
    if (cont)
      cont.innerHTML = `<div class="px-2 text-sm text-red-600">Error al cargar trámites.</div>`;
  }
}

function crearFila(tramite) {
  const numero =
    tramite.nroTramite ??
    tramite.nro ??
    tramite.id ??
    tramite.idtramite ??
    tramite.tramiteNumero ??
    "";
  const estadoActualRaw =
    tramite.estado ?? tramite.status ?? tramite.estadoTramite ?? "pendiente";
  const estadoActual = String(estadoActualRaw).toLowerCase(); 
  const id = tramite.idSolicitud ?? tramite._id ?? numero;

  const container = document.createElement("div");
  container.className = "grid grid-cols-[1fr_1fr_auto] gap-4 items-center px-2";

  const divNum = document.createElement("div");
  divNum.className = "text-lg font-medium text-[#4D3C2D]";
  divNum.textContent = numero;
  container.appendChild(divNum);

  const divSelect = document.createElement("div");
  const select = document.createElement("select");
  select.title = "Estado del trámite";
  select.className =
    "bg-[#C5DBA7] text-[#4D3C2D] px-4 py-2 rounded-full text-sm font-bold border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8A9A7A]";
  select.dataset.id = id; 

  ESTADOS.forEach((opt) => {
    const option = document.createElement("option");
    option.value = opt.toLowerCase();
    option.textContent = opt.charAt(0).toUpperCase() + opt.slice(1);
    if (option.value === estadoActual) option.selected = true;
    select.appendChild(option);
  });

  if(select.value === "aprobada"){
    select.disabled = true;
  }


  divSelect.appendChild(select);
  container.appendChild(divSelect);

  const btnDiv = document.createElement("div");
  const boton = document.createElement("button");
  boton.title = "Ver detalles del trámite";
  boton.className =
    "w-8 h-8 flex items-center justify-center hover:bg-[#E5D9B3] rounded-full transition-colors";
  boton.dataset.id = id;
  boton.innerHTML = `<img
                  src="../public/imgs/icon-download.svg"
                  alt="Descargar"
                  class="w-5 h-5"
                />`;
  btnDiv.appendChild(boton);
  container.appendChild(btnDiv);

  return container;
}


document.addEventListener("DOMContentLoaded", initTabla);
