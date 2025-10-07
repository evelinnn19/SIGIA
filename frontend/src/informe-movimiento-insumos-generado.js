import { getTransacciones, getNameInsumoById } from "./services/TransaccionService.js";
import { getInsumos } from "./services/InsumoService.js";

// === Referencias DOM ===
const filtroCategoria = document.getElementById("filtroCategoria");
const filtroInsumo = document.getElementById("filtroInsumo");
const filtroArea = document.getElementById("filtroArea");
const filtroTipo = document.getElementById("filtroTipo");
const inputDesde = document.getElementById("inputDesde");
const inputHasta = document.getElementById("inputHasta");
const btnFiltrar = document.getElementById("btnFiltrar");
const btnLimpiar = document.getElementById("btnLimpiar");
const btnPdf = document.getElementById("btnPdf");
const btnExcel = document.getElementById("btnExcel");
const tbody = document.getElementById("tbodyMovimientos");

// === Variables globales ===
let todasLasTransacciones = [];

// ================================================================
// 🔹 Cargar Selects dinámicamente
// ================================================================

async function cargarSelects() {
  try {
    const [insumos, transacciones] = await Promise.all([
      getInsumos(),
      getTransacciones(),
    ]);

    // --- Categorías únicas ---
    const categorias = [...new Set(insumos.map((i) => i.categoria).filter(Boolean))];
    filtroCategoria.innerHTML =
      '<option value="">Todas</option>' +
      categorias.map((c) => `<option value="${c}">${c}</option>`).join("");

    // --- Insumos únicos ---
    const nombresInsumos = [...new Set(insumos.map((i) => i.nombre).filter(Boolean))];
    filtroInsumo.innerHTML =
      '<option value="">Todos</option>' +
      nombresInsumos.map((n) => `<option value="${n}">${n}</option>`).join("");

    // --- Áreas (área destino / solicitante) ---
    const areas = [
      ...new Set(transacciones.map((t) => t.areaDestino || t.areaSolicitante).filter(Boolean)),
    ];
    filtroArea.innerHTML =
      '<option value="">Todas</option>' +
      areas.map((a) => `<option value="${a}">${a}</option>`).join("");

    // --- Tipos de movimiento ---
    const tipos = [...new Set(transacciones.map((t) => t.tipoMovimiento).filter(Boolean))];
    filtroTipo.innerHTML =
      '<option value="">Egreso</option>' +
      '<option value="">Ingreso</option>'+
      '<option value="">Todos</option>'+
      tipos.map((t) => `<option value="${t}">${t}</option>`).join("");
  } catch (error) {
    console.error("❌ Error cargando selects:", error);
  }
}

// ================================================================
// 🔹 Renderizar tabla
// ================================================================
function renderTabla(movimientos) {
  if (!movimientos || movimientos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-4 italic text-[#F0E5CD]/80">
          No hay resultados para los filtros seleccionados.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = movimientos.map(
    (m) => `
      <tr class="border-t border-[#F0E5CD]/20">
        <td class="px-4 py-2">${formatearFecha(m.fecha)}</td>
        <td class="px-4 py-2">${m.nombreInsumo ?? "-"}</td>
        <td class="px-4 py-2">${m.categoriaInsumo ?? "-"}</td>
        <td class="px-4 py-2">${m.areaDestino ?? "-"}</td>
        <td class="px-4 py-2">${m.tipo ?? "-"}</td>
        <td class="px-4 py-2 text-right">${m.cantidad ?? "-"}</td>
      </tr>`
  ).join("");
}


// ================================================================
// 🔹 Filtro de movimientos
// ================================================================
function aplicarFiltros() {
  const categoria = filtroCategoria.value;
  const insumo = filtroInsumo.value;
  const area = filtroArea.value;
  const tipo = filtroTipo.value;
  const desde = inputDesde.value ? new Date(inputDesde.value) : null;
  const hasta = inputHasta.value ? new Date(inputHasta.value) : null;

  const filtradas = todasLasTransacciones.filter((t) => {
    const coincideCategoria = categoria
      ? t.insumo?.categoria === categoria
      : true;
    const coincideInsumo = insumo ? t.insumo?.nombre === insumo : true;
    const coincideArea = area ? t.areaDestino === area : true;
    const coincideTipo = tipo ? t.tipoMovimiento === tipo : true;

    let coincideFecha = true;
    if (t.fecha) {
      const fecha = new Date(t.fecha);
      if (desde && fecha < desde) coincideFecha = false;
      if (hasta && fecha > hasta) coincideFecha = false;
    }

    return coincideCategoria && coincideInsumo && coincideArea && coincideTipo && coincideFecha;
  });

  renderTabla(filtradas);
}

// ================================================================
// 🔹 Limpiar filtros
// ================================================================
function limpiarFiltros() {
  filtroCategoria.value = "";
  filtroInsumo.value = "";
  filtroArea.value = "";
  filtroTipo.value = "";
  inputDesde.value = "";
  inputHasta.value = "";
  renderTabla(todasLasTransacciones);
}

// ================================================================
// 🔹 Exportar PDF
// ================================================================
function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Historial de Movimientos de Insumos", 14, 20);
  doc.autoTable({
    html: "#tablaMovimientos",
    startY: 30,
    headStyles: { fillColor: [77, 60, 45], textColor: [253, 242, 197] },
    alternateRowStyles: { fillColor: [245, 234, 200] },
  });
  doc.save("informe_movimientos.pdf");
}

// ================================================================
// 🔹 Exportar Excel
// ================================================================
function exportarExcel() {
  const tabla = document.getElementById("tablaMovimientos");
  const ws = XLSX.utils.table_to_sheet(tabla);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Movimientos");
  XLSX.writeFile(wb, "informe_movimientos.xlsx");
}

// ================================================================
// 🔹 Helpers
// ================================================================
function formatearFecha(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  const fechaCorregida = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
  return fechaCorregida.toLocaleDateString("es-AR");
}

// ================================================================
// 🔹 Eventos
// ================================================================
btnFiltrar.addEventListener("click", aplicarFiltros);
btnLimpiar.addEventListener("click", limpiarFiltros);
btnPdf.addEventListener("click", exportarPDF);
btnExcel.addEventListener("click", exportarExcel);

// Filtros dinámicos sin botón
[filtroCategoria, filtroInsumo, filtroArea, filtroTipo, inputDesde, inputHasta].forEach((el) =>
  el.addEventListener("change", aplicarFiltros)
);

// ================================================================
// 🔹 Inicialización
// ================================================================
document.addEventListener("DOMContentLoaded", async () => {
  const [insumos, transacciones] = await Promise.all([
    getInsumos(),
    getTransacciones(),
  ]);

  await cargarSelects(insumos, transacciones);

  // Mapa de insumos por ID para acceso rápido
const mapaInsumos = new Map(insumos.map(i => [i.idInsumo, i]));

  // Combinar datos de transacción + insumo
  todasLasTransacciones = transacciones.map(t => {
    const insumo = mapaInsumos.get(t.idInsumo);
    return {
      ...t,
      nombreInsumo: insumo ? insumo.nombre : "Desconocido",
      categoriaInsumo: insumo ? insumo.categoria : "Sin categoría",
    };
  });

  renderTabla(todasLasTransacciones);
});
