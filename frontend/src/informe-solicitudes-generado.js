import { getSolicitudes } from "./services/SolicitudServices.js";

     import { definirUsuario } from './services/usuarioEncabezado.js';

    document.addEventListener("DOMContentLoaded", () => {
        console.log('DOM cargado, ejecutando definirUsuario...');
        definirUsuario();
    });
//

const tbody = document.getElementById("tbodySolicitudes");
const filtroEstado = document.getElementById("filtroEstado");
const inputDesde = document.getElementById("filtroDesde");
const inputHasta = document.getElementById("filtroHasta");
const formFiltros = document.getElementById("formFiltros");
const btnPdf = document.getElementById("btnPdf");
const btnExcel = document.getElementById("btnExcel");

let todasLasSolicitudes = []; 

function cargarEstados() {
  const ESTADOS = [
    "Pendiente",
    "Aprobada",
    "Rechazada",
    "Entregada",
    "Cancelada",
  ];

  filtroEstado.innerHTML =
    '<option value="">Todos</option>' +
    ESTADOS.map(
      (estado) =>
        `<option value="${estado}">${
          estado.charAt(0).toUpperCase() + estado.slice(1)
        }</option>`
    ).join("");
}

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

function parseFechaLocal(fechaStr) {
  if (!fechaStr) return null;
  const [year, month, day] = fechaStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

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

function formatearFecha(fechaISO) {
  if (!fechaISO) return "-";
  const [y, m, d] = fechaISO.split("T")[0].split("-");
  return `${d}/${m}/${y}`;
}


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


[filtroEstado, inputDesde, inputHasta].forEach((el) =>
  el.addEventListener("change", aplicarFiltros)
);

btnPdf.addEventListener("click", exportarPDF);
btnExcel.addEventListener("click", exportarExcel);

formFiltros.addEventListener("submit", (e) => e.preventDefault());


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

btnLimpiar.addEventListener("click", () => {
  filtroEstado.value = "";
  inputDesde.value = "";
  inputHasta.value = "";

  renderTabla(todasLasSolicitudes); 
});
