// solicitudes.js (o el archivo donde tenés este código)
import { getItemSolicitudes } from "./services/ItemSolicitudService.js";
import {
  getSolicitudes,
  updateEstadoSolicitud,
} from "./services/SolicitudServices"; // dejar solo la import necesaria
import { registrarActividad } from "./services/actividadUtilidad";

//estetica
     import { definirUsuario } from './services/usuarioEncabezado.js';

    document.addEventListener("DOMContentLoaded", () => {
        console.log('DOM cargado, ejecutando definirUsuario...');
        definirUsuario();
    });
//

// obtener usuarioActual de forma segura (fallback a null si no está)
const usuarioActualRaw = localStorage.getItem("usuarioActual");
const usuarioActual = usuarioActualRaw ? Number(usuarioActualRaw) : null;

const ESTADOS = [
  "Pendiente",
  "Aprobada",
  "Rechazada",
  "Entregada", // corregido
  "Cancelada",
  "Entregado parcialmente",
];

// Renderiza lista completa en el DOM
function renderSolicitudes(lista) {
  const cont = document.getElementById("filas");
  if (!cont) {
    console.warn("#filas no encontrado en el DOM");
    return;
  }

  cont.innerHTML = ""; // limpiar
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

// Delegación de eventos: escucha cambios en selects y clicks en botones
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

      if(nuevoEstado == "Aprobada"){
          entregarElementosSolicitados(id);
        }
      try {

        await updateEstadoSolicitud(id, nuevoEstado);
        console.log("Estado actualizado OK");
        // opcional: mostrar toast o cambiar visual
        await registrarActividad(
          usuarioActual,
          "Cambio de estado en solicitud",
          `Cambio a ${nuevoEstado} en IDSolicitud ${id}`, // template literal para interpolar id
          "--"
        );
      } catch (err) {
        console.error("No se pudo actualizar estado:", err);
        alert("No se pudo actualizar el estado. Intente nuevamente.");
        // opcional: recargar la tabla o revertir select con fetch de la fila
      } finally {
        target.disabled = false;
      }
    }
  });
}


//Aprobar la solicitud entregando los elementos
async function  entregarElementosSolicitados(id){
  let itemSolicitados = await getItemSolicitudes();
  let itemsaProcesar = itemSolicitados.filter(item => item.idSolicitud == id);

}

// Inicialización: fetch + render + attach events
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

// Genera un nodo DOM para una fila (recibe un objeto 'tramite')
function crearFila(tramite) {
  // normalizar nombre de campo del número de tramite (fallbacks)
  const numero =
    tramite.nroTramite ??
    tramite.nro ??
    tramite.id ??
    tramite.idtramite ??
    tramite.tramiteNumero ??
    "";
  const estadoActualRaw =
    tramite.estado ?? tramite.status ?? tramite.estadoTramite ?? "pendiente";
  const estadoActual = String(estadoActualRaw).toLowerCase(); // normalizo a minusculas
  // guardamos el id real para acciones
  const id = tramite.idSolicitud ?? tramite._id ?? numero;

  // creamos el contenedor
  const container = document.createElement("div");
  container.className = "grid grid-cols-[1fr_1fr_auto] gap-4 items-center px-2";

  // Numero
  const divNum = document.createElement("div");
  divNum.className = "text-lg font-medium text-[#4D3C2D]";
  divNum.textContent = numero;
  container.appendChild(divNum);

  // Select de estados
  const divSelect = document.createElement("div");
  const select = document.createElement("select");
  select.title = "Estado del trámite";
  select.className =
    "bg-[#C5DBA7] text-[#4D3C2D] px-4 py-2 rounded-full text-sm font-bold border-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8A9A7A]";
  select.dataset.id = id; // para identificar luego

  // agregamos opciones: value en minúsculas para comparar fácil, texto con mayúscula inicial
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

  // Botón descargar / ver detalle
  const btnDiv = document.createElement("div");
  const boton = document.createElement("button");
  boton.title = "Ver detalles del trámite";
  boton.className =
    "w-8 h-8 flex items-center justify-center hover:bg-[#E5D9B3] rounded-full transition-colors";
  boton.dataset.id = id;
  // fijate el nombre real de tu imagen (sin doble punto)
  boton.innerHTML = `<img
                  src="../public/imgs/icon-download.svg"
                  alt="Descargar"
                  class="w-5 h-5"
                />`;
  btnDiv.appendChild(boton);
  container.appendChild(btnDiv);

  return container;
}

//Debemos hacer un metodo para crear actividad. Debe ser general, sino se repite el codigo. Propongo lo siguiente.

document.addEventListener("DOMContentLoaded", initTabla);
