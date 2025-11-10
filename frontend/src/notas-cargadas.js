import { getInsumos,updateInsumo } from "./services/InsumoService.js";
import { getItemSolicitudes, updateItemSolicitud } from "./services/ItemSolicitudService.js";
import { createTransaccion } from "./services/TransaccionService.js";
import {getSolicitudById, getSolicitudes, updateEstadoSolicitud} from "./services/SolicitudServices"; 
import { registrarActividad } from "./services/actividadUtilidad";
import { renderSimpleComprobantePDF} from "./services/comprobanteUtilidad.js"

     import { definirUsuario } from './services/usuarioEncabezado.js';
import { alertasStockMinimo } from "./services/AlertasUtilidad.js";

    document.addEventListener("DOMContentLoaded", () => {
        console.log('DOM cargado, ejecutando definirUsuario...');
        definirUsuario();
    });

const usuarioActualRaw = localStorage.getItem("usuarioActual");
const usuarioActual = usuarioActualRaw ? Number(usuarioActualRaw) : null;

const ESTADOS = [
  "Pendiente",
  "Entregada", 
  
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
    if (target.tagName.toLowerCase() !== "select") return;

    // bloquear el select mientras procesamos
    target.disabled = true;

    // Estado nuevo desde el select (value viene en minúsculas)
    const nuevoValorRaw = String(target.value || "").toLowerCase();
    const nuevoEstado = nuevoValorRaw.charAt(0).toUpperCase() + nuevoValorRaw.slice(1); // "Entregada", "Pendiente"

    const id = target.dataset.id;
    const prev = target.dataset.prev || ""; // estado anterior guardado en crearFila
    console.log("Actualizar estado", id, prev, "->", nuevoEstado);

    try {
      // Si ya estaba entregada, no permitimos cambios
      if (prev === "entregada") {
        console.warn("Solicitud ya entregada; cambios no permitidos.");
        // revertir visualmente por seguridad
        target.value = prev;
        return;
      }

      // Si el usuario cambió a 'entregada' primero intentamos entregar elementos
      let entregaOk = true;
      if (nuevoEstado === "Entregada") {
        // llamar a la función que realiza la entrega (ya implementada)
        const resultado = await entregarElementosSolicitados(id);
        if (!resultado || resultado.exito === false) {
          entregaOk = false;
          // mostrar alerta / log
          console.error("La entrega falló:", resultado && resultado.mensaje);
          alert("No se pudo completar la entrega. Revirtiendo estado.");
        } else {
          console.log("Entrega realizada OK:", resultado.mensaje);
          await alertasStockMinimo();
        }
      }

      if (!entregaOk) {
        // revertimos el select al estado previo
        target.value = prev;
        return;
      }

      // Si llegamos acá: o el nuevo estado no es 'Entregada' o la entrega fue OK.
      await updateEstadoSolicitud(id, nuevoEstado);
      // actualizamos dataset.prev al nuevo estado en minúscula
      target.dataset.prev = nuevoValorRaw;
      // si quedó entregada, deshabilitamos definitivamente
      if (nuevoValorRaw === "entregada") {
        target.disabled = true;
      }

      await registrarActividad(
        usuarioActual,
        "Cambio de estado en solicitud",
        `Cambio a ${nuevoEstado} en IDSolicitud ${id}`, 
        "--"
      );

      console.log("Estado actualizado OK");

    } catch (err) {
      console.error("No se pudo actualizar estado:", err);
      // revertir visualmente al estado previo
      target.value = target.dataset.prev || "";
      alert("No se pudo actualizar el estado. Intente nuevamente.");
    } finally {
      // si aún no es entregada y no hubo error, dejar habilitado;
      // si prev era entregada ya devolvimos antes; si quedó entregada lo dejamos disabled.
      if (target.dataset.prev !== "entregada" && target.value !== "entregada") {
        target.disabled = false;
      }
    }
  });


  // Event listener para el botón de descarga
  cont.addEventListener("click", async (e) => {
    const target = e.target.closest("button");
    if (target && target.dataset.id) {
      const id = target.dataset.id;
      console.log("🔽 ID del botón clickeado:", id);
      
      // Aquí puedes llamar a tu función
      manejarClickBoton(id);
      // O cualquier otra función que necesites
    }
  });
}

async function manejarClickBoton(id){
       try {
    let solicitud = await getSolicitudById(id);
    console.log("Solicitud obtenida:", solicitud);
    
    let itemSolicitados = await getItemSolicitudes();
    console.log("Items solicitados:", itemSolicitados);
    
    let itemsaProcesar = itemSolicitados.filter(item => item.idSolicitud == id);
    console.log("Items a procesar:", itemsaProcesar);
    
    let todosInsumos = await getInsumos();
    let insumosaProcesar = todosInsumos.filter(insumo => 
      itemsaProcesar.some(item => item.idInsumo == insumo.idInsumo)
    );

    // Preparar datos para el comprobante
    const datosComprobante = [];
    
    for (let item of itemsaProcesar) {
      const insumo = insumosaProcesar.find(ins => ins.idInsumo == item.idInsumo);
      if (insumo) {
        datosComprobante.push({
          nombre: insumo.nombre || 'N/A',
          area: solicitud.area || 'N/A',
          solicitante: solicitud.solicitante || 'N/A',
          cantidadSolicitada: item.cantSolicitada || 0,
          cantidadEntregada: item.cantEntregada || 0
        });
      }
    }

    console.log("Datos para comprobante:", datosComprobante);

    // Mostrar opciones al usuario
    mostrarOpcionesDescarga(solicitud, datosComprobante);

  } catch (error) {
    console.error('Error al obtener datos para comprobante:', error);
    alert('Error al generar el comprobante. Intente nuevamente.');
  }


}

function mostrarOpcionesDescarga(solicitud, datosComprobante) {
  // Intentar obtener contenedor existente
  let cont = document.querySelector('#comprobanteWrap');

  // Si no existe, creamos un modal y un contenedor dentro
  let modalCreado = false;
  if (!cont) {
    modalCreado = true;
    const modal = document.createElement('div');
    modal.id = 'comprobanteModal';
    modal.style.cssText = `
      position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
      background: rgba(0,0,0,0.45); z-index: 9999; padding: 20px;
    `;

    const panel = document.createElement('div');
    panel.style.cssText = `
      background: white; width: 100%; max-width: 900px; max-height: 90vh; overflow:auto;
      border-radius: 8px; padding: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.25);
    `;
    panel.id = 'comprobantePanel';

    // Botón cerrar
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Cerrar';
    closeBtn.style.cssText = 'position:absolute; right:18px; top:12px; padding:6px 10px; cursor:pointer;';
    closeBtn.addEventListener('click', () => {
      if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
    });

    // Contenedor donde renderizaremos la tabla + botones
    cont = document.createElement('div');
    cont.id = 'comprobanteWrap';
    cont.style.cssText = 'padding-top: 10px;';

    panel.appendChild(closeBtn);
    panel.appendChild(cont);
    modal.appendChild(panel);
    document.body.appendChild(modal);

    // Cerrar modal al click fuera del panel
    modal.addEventListener('click', (ev) => {
      if (ev.target === modal) {
        if (modal.parentNode) modal.parentNode.removeChild(modal);
      }
    });
  } else {
    // si existe, vaciarlo
    cont.innerHTML = '';
  }

  // Ahora llamamos a la función que crea la tabla y el botón PDF.
  // Asumo que ya definiste renderSimpleComprobantePDF (la función que te pasé antes).
  try {
    renderSimpleComprobantePDF('#comprobanteWrap', solicitud, datosComprobante);
  } catch (err) {
    console.error('Error al renderizar comprobante:', err);
    cont.innerHTML = `<p style="color: #b91c1c;">Error al renderizar comprobante: ${err.message}</p>`;
  }

  // Si querés auto-remover el modal después de descargar, podés enganchar el botón.
  // Buscamos el botón "Descargar PDF" que la función crea y le agregamos lógica para cerrar el modal luego de guardar.
  setTimeout(() => {
    const modal = document.getElementById('comprobanteModal');
    const btnPdf = document.querySelector('#comprobanteWrap button'); // primer botón dentro del wrap
    if (btnPdf && modal) {
      btnPdf.addEventListener('click', () => {
        // esperar un poco para que html2pdf termine (html2pdf retorna promesa si querés)
        // aquí cerramos el modal tras un pequeño delay; si preferís, usar la promesa de html2pdf.
        setTimeout(() => {
          if (modal.parentNode) modal.parentNode.removeChild(modal);
        }, 600);
      }, { once: true });
    }
  }, 200);
}



  


//Aprobar la solicitud entregando los elementos
async function  entregarElementosSolicitados(id){
    try {
    console.log("aHORA SE PEDIRA LA SOLICITUD");
    
    let solicitud = await getSolicitudById(id);
    console.log("Solicitud obtenida:", solicitud);
    
    let itemSolicitados = await getItemSolicitudes();
    console.log("Items solicitados:", itemSolicitados);
    
    let itemsaProcesar = itemSolicitados.filter(item => item.idSolicitud == id);
    console.log("Items a procesar:", itemsaProcesar);
    
    let todosInsumos = await getInsumos();
    let insumosaProcesar = todosInsumos.filter(insumo => 
      itemsaProcesar.some(item => item.idInsumo == insumo.idInsumo)
    );
    
    let resultados = [];
    
    for (let i = 0; i < itemsaProcesar.length; i++) {
      let itemSol = itemsaProcesar[i];
      let insumo = insumosaProcesar.find(ins => ins.idInsumo == itemSol.idInsumo);
      
      if (!insumo) {
        console.error(`Insumo no encontrado: ${itemSol.idInsumo}`);
        continue;
      }
      
      // Usar cantSolicitada
      let cantidadEntregar = Math.min(itemSol.cantSolicitada, insumo.stockActual);
      
      resultados.push({
        item: itemSol,
        insumo: insumo,
        cantidadEntregar: cantidadEntregar
      });
    }
    
    // Procesar las entregas
    for (let resultado of resultados) {
      console.log("=== PROCESANDO RESULTADO ===", resultado);
      let { item, insumo, cantidadEntregar } = resultado;
      
      if (cantidadEntregar > 0) {
       
        item.cantEntregada = cantidadEntregar;
        await updateItemSolicitud(item.idItem, item); 
        
        insumo.stockActual -= cantidadEntregar;
        await updateInsumo(insumo.idInsumo, insumo);
        
        let transaccion = {
          tipo: "Egreso",
          fecha: new Date().toISOString().split('T')[0],
          cantidad: Number(cantidadEntregar), 
          areaDestino: solicitud.area,    
          solicitante: solicitud.solicitante, 
          idInsumo: insumo.idInsumo,
          idUsuario: usuarioActual
        };

        console.log("📄 Transacción a crear:", transaccion);
        await createTransaccion(transaccion);
        console.log(`✅ Entregado: ${cantidadEntregar} de ${insumo.nombre}`);
      }
    }

    await alertasStockMinimo();
    
    return { exito: true, mensaje: "Elementos entregados correctamente" };
    
  } catch (error) {
    console.error('Error detallado:', error);
    return { exito: false, mensaje: `Error: ${error.message}` };
  }
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

    
  if (estadoActual === "entregada") {
    select.disabled = true;
    select.dataset.prev = "entregada"; // guardamos estado previo
  } else {
    select.dataset.prev = estadoActual; // guardamos para posibles revert
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

//Crear la tabla de insumos para esa solicitud


document.addEventListener("DOMContentLoaded", initTabla);
