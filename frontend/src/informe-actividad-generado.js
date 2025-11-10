import { getActividades } from "./services/ActividadService.js";
import { getUsuarios } from "./services/UsuarioService.js";

import { definirUsuario } from './services/usuarioEncabezado.js';

document.addEventListener("DOMContentLoaded", () => {
  console.log('DOM cargado, ejecutando definirUsuario...');
  definirUsuario();

  // Obtener la fecha de hoy en formato YYYY-MM-DD
  const hoy = new Date().toISOString().split("T")[0];

  // Seleccionar todos los inputs de tipo date
  const inputsFecha = document.querySelectorAll('input[type="date"]');

  // Aplicar el atributo max a cada uno
  inputsFecha.forEach((input) => {
    input.setAttribute("max", hoy);
  });
});

// DOM refs
const filtroUsuario = document.getElementById("filtroUsuario");
const inputDesde = document.getElementById("inputDesde");
const inputHasta = document.getElementById("inputHasta");
const btnLimpiar = document.getElementById("btnLimpiar");
const btnPdf = document.getElementById("btnPdf");
const btnExcel = document.getElementById("btnExcel");
const contenedorTabla = document.getElementById("contenedorTabla");

let todasLasActividades = [];
let mapaUsuarios = new Map();

// Helper: obtener nombre de usuario con fallbacks
function nombreUsuarioDisplay(u) {
  if (!u) return "Desconocido";
  // Intentamos distintos campos comunes
  const nameCandidates = [
    u.nombre_apellido,
    u.nombreCompleto,
    u.nombre,
    (u.nombre && u.apellido) ? `${u.nombre} ${u.apellido}` : null,
    u.email,
    u.correo,
    u.rol
  ];
  const found = nameCandidates.find(v => v && String(v).trim().length > 0);
  return found ? String(found).trim() : "Desconocido";
}

async function cargarUsuarios() {
  try {
    const usuarios = await getUsuarios();

    // construir mapa idUsuario -> displayName
    mapaUsuarios = new Map((usuarios || []).map((u) => [u.idUsuario, nombreUsuarioDisplay(u)]));

    filtroUsuario.innerHTML =
      '<option value="">Todos</option>' +
      (usuarios || [])
        .map(
          (u) => `<option value="${u.idUsuario}">${nombreUsuarioDisplay(u)}</option>`
        )
        .join("");
  } catch (err) {
    console.error("❌ Error cargando usuarios:", err);
  }
}

function renderTabla(actividades) {
  if (!actividades || actividades.length === 0) {
    contenedorTabla.innerHTML = `
      <div class="text-center italic text-[#4D3C2D]/70 mt-10">
        No hay resultados para los filtros seleccionados.
      </div>`;
    return;
  }

  const filas = actividades
    .map(
      (a) => `
      <tr class="border-t border-[#F0E5CD]/20">
        <td class="px-4 py-2">${mapaUsuarios.get(a.idUsuario) ?? "Desconocido"}</td>
        <td class="px-4 py-2">${a.accionRealizada ?? "-"}</td>
        <td class="px-4 py-2">${a.descripcion ?? "-"}</td>
        <td class="px-4 py-2 text-center">${a.areaAfectada ?? "-"}</td>
        <td class="px-4 py-2 text-center">${formatearFecha(a.fecha)}</td>
      </tr>`
    )
    .join("");

  contenedorTabla.innerHTML = `
    <div class="border border-[#4D3C2D]/30 rounded-2xl overflow-hidden shadow-sm">
      <div class="overflow-y-auto thin-scroll max-h-[420px]">
        <table id="tablaActividad" class="w-full text-sm md:text-base text-left">
          <thead class="bg-[#4D3C2D] text-[#FDF2C5] sticky top-0">
            <tr>
              <th class="px-4 py-3 font-extrabold">Usuario</th>
              <th class="px-4 py-3 font-extrabold">Acción Realizada</th>
              <th class="px-4 py-3 font-extrabold">Descripción</th>
              <th class="px-4 py-3 font-extrabold text-center">Área Afectada</th>
              <th class="px-4 py-3 font-extrabold text-center">Fecha</th>
            </tr>
          </thead>
          <tbody class="bg-[#6b5946] text-[#F0E5CD]">
            ${filas}
          </tbody>
        </table>
      </div>
    </div>`;
}

function aplicarFiltros() {
  const idUsuario = filtroUsuario.value;
  const desde = inputDesde.value ? new Date(inputDesde.value) : null;
  const hasta = inputHasta.value ? new Date(inputHasta.value) : null;

  const filtradas = todasLasActividades.filter((a) => {
    const coincideUsuario = idUsuario ? String(a.idUsuario) === idUsuario : true;

    let coincideFecha = true;
    if (a.fecha) {
      const fecha = new Date(a.fecha);
      if (desde && fecha < desde) coincideFecha = false;
      if (hasta && fecha > hasta) coincideFecha = false;
    }

    return coincideUsuario && coincideFecha;
  });

  // ordenar por fecha descendente: más reciente primero
  filtradas.sort((x, y) => new Date(y.fecha) - new Date(x.fecha));

  renderTabla(filtradas);
}

function limpiarFiltros() {
  filtroUsuario.value = "";
  inputDesde.value = "";
  inputHasta.value = "";
  renderTabla(todasLasActividades);
}

function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Informe de Actividad de Usuarios", 14, 20);
  doc.autoTable({
    html: "#tablaActividad",
    startY: 30,
    headStyles: { fillColor: [77, 60, 45], textColor: [253, 242, 197] },
    alternateRowStyles: { fillColor: [245, 234, 200] },
  });
  doc.save("informe_actividad.pdf");
}

function exportarExcel() {
  const tabla = document.getElementById("tablaActividad");
  const ws = XLSX.utils.table_to_sheet(tabla);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Actividad");
  XLSX.writeFile(wb, "informe_actividad.xlsx");
}

function formatearFecha(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  // normalizamos a la fecha local para evitar desfases
  const fechaCorregida = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
  return fechaCorregida.toLocaleDateString("es-AR");
}

[filtroUsuario, inputDesde, inputHasta].forEach((el) =>
  el.addEventListener("change", aplicarFiltros)
);
btnLimpiar.addEventListener("click", limpiarFiltros);
btnPdf.addEventListener("click", exportarPDF);
btnExcel.addEventListener("click", exportarExcel);

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await cargarUsuarios();

    todasLasActividades = await getActividades() || [];

    // ordenar globalmente por fecha descendente (más recientes primero)
    todasLasActividades.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    renderTabla(todasLasActividades);
  } catch (err) {
    console.error("❌ Error al cargar actividades:", err);
  }
});
