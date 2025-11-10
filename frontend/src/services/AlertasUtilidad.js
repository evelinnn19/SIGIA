// src/utils/alertasStockMinimo.js
import { getInsumos } from "../services/InsumoService.js";

/**
 * alertasStockMinimo(options)
 * Muestra un popup con insumos cuyo stockActual está por debajo o cerca del stockMinimo.
 *
 * options:
 *  - thresholdPct: porcentaje (0..1) que define "cerca" del mínimo (por defecto 0.2 -> 20%)
 *  - minDelta: número absoluto mínimo extra (por defecto 2) que también considera "cerca"
 *  - containerId: id del popup (evita duplicados), por defecto 'popupStockMinimo'
 *  - onlyShowIfAny: si true, NO muestra nada si no hay insumos para alertar (default true)
 *
 * Devuelve un objeto { criticos: [], cercanos: [] } con las listas encontradas.
 */
export async function alertasStockMinimo(options = {}) {
  const {
    thresholdPct = 0.2,
    minDelta = 2,
    containerId = "popupStockMinimo",
    onlyShowIfAny = true,
  } = options;

  // Traer insumos
  let insumos = [];
  try {
    insumos = await getInsumos() || [];
  } catch (err) {
    console.error("alertasStockMinimo: no se pudieron cargar insumos:", err);
    // mostrar error pequeño y salir
    crearPopupError("No se pudieron cargar los insumos para verificar stock.", containerId);
    return { criticos: [], cercanos: [] };
  }

  // Filtrar y clasificar
  const criticos = [];
  const cercanos = [];

  for (const i of insumos) {
    const stockActual = Number(i.stockActual ?? 0);
    const stockMinimo = Number(i.stockMinimo ?? 0);

    if (!stockMinimo || stockMinimo <= 0) continue; // si no hay mínimo definido, lo ignoramos

    if (stockActual <= stockMinimo) {
      criticos.push(i);
    } else {
      const delta = Math.max(minDelta, Math.ceil(stockMinimo * thresholdPct));
      if (stockActual <= stockMinimo + delta) {
        cercanos.push(i);
      }
    }
  }

  // Si no hay nada para mostrar y onlyShowIfAny=true, no mostramos
  if (onlyShowIfAny && criticos.length === 0 && cercanos.length === 0) {
    return { criticos, cercanos };
  }

  // Construir y mostrar popup con la lista
  crearPopupLista({ criticos, cercanos, containerId });

  return { criticos, cercanos };
}

/* Helper: crea el popup de lista y lo muestra */
function crearPopupLista({ criticos = [], cercanos = [], containerId = "popupStockMinimo" }) {
  // Si ya existe un popup con este id, lo removemos para recrearlo
  const existing = document.getElementById(containerId);
  if (existing) existing.remove();

  // overlay
  const overlay = document.createElement("div");
  overlay.id = containerId;
  overlay.className = "fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50";

  // card
  const card = document.createElement("div");
  card.className = "bg-[#FDF2C5] rounded-3xl p-6 text-left shadow-lg w-[min(760px,95%)]";

  // header
  const header = document.createElement("div");
  header.className = "flex items-start justify-between gap-4 mb-4";
  const title = document.createElement("h3");
  title.className = "text-2xl font-extrabold text-[#4D3C2D]";
  title.textContent = "Alertas de stock mínimo";
  header.appendChild(title);

  const small = document.createElement("div");
  small.className = "text-sm text-[#4D3C2D]/70";
  const time = new Date().toLocaleString("es-AR");
  small.textContent = `última verificación: ${time}`;
  header.appendChild(small);

  // body
  const body = document.createElement("div");
  body.className = "max-h-[55vh] overflow-y-auto pr-2";

  if (criticos.length === 0 && cercanos.length === 0) {
    const p = document.createElement("p");
    p.className = "text-[#4D3C2D]";
    p.textContent = "No se encontraron insumos por debajo o cerca del stock mínimo.";
    body.appendChild(p);
  } else {
    if (criticos.length > 0) {
      const sec = crearSeccionLista("Críticos (stock ≤ mínimo)", criticos, true);
      body.appendChild(sec);
    }
    if (cercanos.length > 0) {
      const sec2 = crearSeccionLista("Cerca del mínimo", cercanos, false);
      body.appendChild(sec2);
    }
  }

  // footer: botones
  const footer = document.createElement("div");
  footer.className = "flex items-center justify-end gap-3 mt-4";

  const btnCerrar = document.createElement("button");
  btnCerrar.className = "px-6 py-2 bg-[#4D3C2D] text-white font-bold rounded-full hover:bg-[#3D3023]";
  btnCerrar.textContent = "Cerrar";
  btnCerrar.addEventListener("click", () => overlay.remove());

  const btnVerListadoCompleto = document.createElement("button");
  btnVerListadoCompleto.className = "px-6 py-2 bg-transparent border-2 border-[#4D3C2D] text-[#4D3C2D] font-bold rounded-full hover:bg-[#4D3C2D] hover:text-white";
  btnVerListadoCompleto.textContent = "Ver todos los insumos";
  btnVerListadoCompleto.addEventListener("click", () => {
    // si tenés una página de listado, podés redirigir; por ahora cerramos y dejamos que el usuario navegue
    overlay.remove();
    // window.location.href = 'insumo-lista.html';
  });

  footer.appendChild(btnVerListadoCompleto);
  footer.appendChild(btnCerrar);

  // montar
  card.appendChild(header);
  card.appendChild(body);
  card.appendChild(footer);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}

/* helper: crear sección (título + tabla/lista) */
function crearSeccionLista(tituloTexto, items = [], esCritico = false) {
  const sec = document.createElement("div");
  sec.className = "mb-4";

  const h = document.createElement("h4");
  h.className = "text-lg font-bold text-[#4D3C2D] mb-2";
  h.textContent = tituloTexto;
  sec.appendChild(h);

  const tabla = document.createElement("table");
  tabla.className = "w-full text-sm border-collapse";

  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr class="text-left text-[#4D3C2D]/80">
      <th class="pb-1">Insumo</th>
      <th class="pb-1">Categoría</th>
      <th class="pb-1 text-right">Stock actual</th>
      <th class="pb-1 text-right">Stock mínimo</th>
    </tr>
  `;
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (const it of items) {
    const tr = document.createElement("tr");
    tr.className = "border-t border-[#E9E3CB]";

    const nombreTd = document.createElement("td");
    nombreTd.className = "py-2";
    nombreTd.textContent = it.nombre ?? "";

    const catTd = document.createElement("td");
    catTd.className = "py-2";
    catTd.textContent = it.categoria ?? "";

    const stockTd = document.createElement("td");
    stockTd.className = "py-2 text-right font-semibold";
    stockTd.textContent = String(it.stockActual ?? 0);

    const minTd = document.createElement("td");
    minTd.className = "py-2 text-right";
    minTd.textContent = String(it.stockMinimo ?? 0);

    // si es crítico, colorear la fila / stock
    if (esCritico) {
      nombreTd.classList.add("text-[#B91C1C]");
      stockTd.classList.add("text-[#B91C1C]");
      tr.style.background = "rgba(185,28,28,0.04)";
    } else {
      // cercano
      stockTd.classList.add("text-[#B45309]"); // amber-700
      tr.style.background = "rgba(245, 165, 0, 0.03)";
    }

    tr.appendChild(nombreTd);
    tr.appendChild(catTd);
    tr.appendChild(stockTd);
    tr.appendChild(minTd);
    tbody.appendChild(tr);
  }
  tabla.appendChild(tbody);

  sec.appendChild(tabla);
  return sec;
}

/* helper: popup error cuando falla la carga de insumos */
function crearPopupError(mensaje, containerId = "popupStockMinimo") {
  // si ya existe overlay lo eliminamos
  const existing = document.getElementById(containerId);
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = containerId;
  overlay.className = "fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50";

  const card = document.createElement("div");
  card.className = "bg-[#FDF2C5] rounded-3xl p-8 text-center shadow-lg w-[420px]";

  const h = document.createElement("h3");
  h.className = "text-2xl font-extrabold mb-4 text-[#B91C1C]";
  h.textContent = "Error";

  const p = document.createElement("p");
  p.className = "text-[#4D3C2D] mb-6";
  p.textContent = mensaje || "Ocurrió un error";

  const btn = document.createElement("button");
  btn.className = "px-6 py-2 bg-[#4D3C2D] text-white font-bold rounded-full hover:bg-[#3D3023]";

  btn.textContent = "Cerrar";
  btn.addEventListener("click", () => overlay.remove());

  card.appendChild(h);
  card.appendChild(p);
  card.appendChild(btn);
  overlay.appendChild(card);
  document.body.appendChild(overlay);
}
