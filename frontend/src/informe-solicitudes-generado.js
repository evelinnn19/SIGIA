import { getSolicitudes } from "./services/SolicitudServices.js";

const tbody = document.getElementById("tbodySolicitudes");
const filtroEstado = document.getElementById("filtroEstado");
const inputDesde = document.getElementById("filtroDesde");
const inputHasta = document.getElementById("filtroHasta");
const formFiltros = document.getElementById("formFiltros");
const btnPdf = document.getElementById("btnPdf");
const btnExcel = document.getElementById("btnExcel");

let todasLasSolicitudes = []; // cache local

// =================== FUNCIONES PRINCIPALES ===================

// 🔹 Cargar estados dinámicamente
function cargarEstados() {
  const ESTADOS = [
    "pendiente",
    "aprobada",
    "rechazada",
    "entregada",
    "cancelada",
    "entregado parcialmente",
  ];

  filtroEstado.innerHTML =
    '<option value="">Todos</option>' +
    ESTADOS.map(
      (estado) =>
        `<option value="${estado}">${estado.charAt(0).toUpperCase() + estado.slice(1)}</option>`
    ).join("");
}

// 🔹 Renderizar tabla
function renderTabla(solicitudes) {
  if (!solicitudes || solicitudes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-4 italic text-[#F0E5CD]/80">
          No hay resultados para los filtros seleccionados.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = solicitudes
    .map(
      (s) => `
      <tr class="border-t border-[#F0E5CD]/20">
        <td class="px-4 py-2">${s.nroTramite ?? "-"}</td>
        <td class="px-4 py-2">${s.estado ?? "-"}</td>
        <td class="px-4 py-2">${s.solicitante ?? "-"}</td>
        <td class="px-4 py-2">${formatearFecha(s.fecha)}</td>
      </tr>`
    )
    .join("");
}

// 🔹 Convertir string 'YYYY-MM-DD' en fecha local sin timezone
function parseFechaLocal(fechaStr) {
  if (!fechaStr) return null;
  const [year, month, day] = fechaStr.split("-").map(Number);
  // new Date(year, monthIndex, day) usa zona horaria local
  return new Date(year, month - 1, day);
}

// 🔹 Aplicar filtros (estado + rango de fechas)
function aplicarFiltros() {
  const estado = filtroEstado.value;
  const desde = inputDesde.value ? parseFechaLocal(inputDesde.value) : null;
  const hasta = inputHasta.value ? parseFechaLocal(inputHasta.value) : null;

  const filtradas = todasLasSolicitudes.filter((s) => {
    const coincideEstado = estado ? s.estado === estado : true;

    let coincideFecha = true;
    if (s.fecha) {
      const fechaSolicitud = parseFechaLocal(s.fecha.split("T")[0]);
      if (desde && fechaSolicitud < desde) coincideFecha = false;
      if (hasta && fechaSolicitud > hasta) coincideFecha = false;
    }

    return coincideEstado && coincideFecha;
  });

  renderTabla(filtradas);
}

// 🔹 Formatear fecha (manteniendo la fecha local correcta)
function formatearFecha(fechaISO) {
  if (!fechaISO) return "-";
  const [y, m, d] = fechaISO.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
}

// =================== EXPORTAR PDF / EXCEL ===================

function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Informe de Solicitudes", 14, 20);
  doc.autoTable({
    html: "#tablaSolicitudes",
    startY: 30,
    headStyles: { fillColor: [77, 60, 45], textColor: [253, 242, 197] },
    alternateRowStyles: { fillColor: [245, 234, 200] },
  });
  doc.save("informe_solicitudes.pdf");
}

function exportarExcel() {
  const tabla = document.getElementById("tablaSolicitudes");
  const ws = XLSX.utils.table_to_sheet(tabla);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Solicitudes");
  XLSX.writeFile(wb, "informe_solicitudes.xlsx");
}

// =================== EVENTOS ===================

// 🔸 Actualiza la tabla automáticamente al cambiar filtros
[filtroEstado, inputDesde, inputHasta].forEach((el) =>
  el.addEventListener("change", aplicarFiltros)
);

// 🔸 Botones de exportar
btnPdf.addEventListener("click", exportarPDF);
btnExcel.addEventListener("click", exportarExcel);

// 🔸 Evita recarga al enviar formulario
formFiltros.addEventListener("submit", (e) => e.preventDefault());

// =================== INICIALIZACIÓN ===================

document.addEventListener("DOMContentLoaded", async () => {
  cargarEstados();

  try {
    todasLasSolicitudes = await getSolicitudes();
    renderTabla(todasLasSolicitudes);
  } catch (error) {
    console.error("❌ Error al cargar solicitudes:", error);
  }
});

const btnLimpiar = document.getElementById("btnLimpiar");

// 🔹 Limpiar filtros y recargar todas las solicitudes
btnLimpiar.addEventListener("click", () => {
  filtroEstado.value = "";
  inputDesde.value = "";
  inputHasta.value = "";

  renderTabla(todasLasSolicitudes); // volver a mostrar todo
});
