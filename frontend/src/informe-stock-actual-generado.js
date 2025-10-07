import { getInsumos } from "./services/InsumoService.js";

//estetica
    import { definirUsuario } from './src/services/usuarioEncabezado.js';

    document.addEventListener("DOMContentLoaded", () => {
        console.log('DOM cargado, ejecutando definirUsuario...');
        definirUsuario();
    });
//

const tbody = document.getElementById("tbodyStock");
const filtroCategoria = document.getElementById("filtroCategoria");
const filtroCritico = document.getElementById("filtroCritico");
const formFiltros = document.getElementById("formFiltros");
const btnPdf = document.getElementById("btnPdf");
const btnExcel = document.getElementById("btnExcel");

// =================== FUNCIONES PRINCIPALES ===================

// 🔹 Cargar categorías dinámicas desde los insumos existentes
async function cargarCategorias() {
  try {
    const insumos = await getInsumos();

    // Obtener categorías únicas
    const categoriasUnicas = [
      ...new Set(insumos.map((i) => i.categoria).filter(Boolean)),
    ];

    filtroCategoria.innerHTML =
      '<option value="">Todas</option>' +
      categoriasUnicas
        .map((cat) => `<option value="${cat}">${cat}</option>`)
        .join("");
  } catch (error) {
    console.error("❌ Error al cargar categorías:", error);
  }
}

// 🔹 Renderizar tabla con los insumos
function renderTabla(insumos) {
  if (!insumos || insumos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-4 italic text-[#F0E5CD]/80">
          No hay resultados para los filtros seleccionados.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = insumos
    .map(
      (i) => `
      <tr class="border-t border-[#F0E5CD]/20">
        <td class="px-4 py-2">${i.nombre}</td>
        <td class="px-4 py-2">${i.categoria}</td>
        <td class="px-4 py-2 text-right">${i.stockActual}</td>
        <td class="px-4 py-2 text-center">${i.critico === 1 ? "Sí" : "No"}</td>
      </tr>
    `
    )
    .join("");
}

filtroCategoria.addEventListener("change", filtrarInsumos);
filtroCritico.addEventListener("change", filtrarInsumos);
// 🔹 Aplicar filtros (por categoría y crítico)
async function filtrarInsumos(e) {
  e.preventDefault();

  const categoria = filtroCategoria.value;
  const critico = filtroCritico.value;

  try {
    const insumos = await getInsumos();

    const filtrados = insumos.filter(
      (i) =>
        (categoria ? i.categoria === categoria : true) &&
        (critico !== "" ? i.critico === parseInt(critico) : true)
    );

    renderTabla(filtrados);
  } catch (error) {
    console.error("❌ Error al filtrar insumos:", error);
  }
}

// =================== EXPORTAR PDF / EXCEL ===================

// 🔹 Exportar PDF con jspdf-autotable
function exportarPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Informe de Stock Actual", 14, 20);
  doc.autoTable({
    html: "#tablaStock",
    startY: 30,
    headStyles: { fillColor: [77, 60, 45], textColor: [253, 242, 197] },
    alternateRowStyles: { fillColor: [245, 234, 200] },
  });
  doc.save("informe_stock.pdf");
}

// 🔹 Exportar Excel con xlsx
function exportarExcel() {
  const tabla = document.getElementById("tablaStock");
  const ws = XLSX.utils.table_to_sheet(tabla);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Stock");
  XLSX.writeFile(wb, "informe_stock.xlsx");
}

// =================== EVENTOS ===================

formFiltros.addEventListener("submit", filtrarInsumos);
btnPdf.addEventListener("click", exportarPDF);
btnExcel.addEventListener("click", exportarExcel);

// =================== INICIALIZACIÓN ===================

document.addEventListener("DOMContentLoaded", async () => {
  await cargarCategorias();
  const insumos = await getInsumos();
  renderTabla(insumos);

  const btnLimpiar = document.getElementById("btnLimpiar");

  // 🔹 Limpiar filtros y recargar todas las solicitudes
  btnLimpiar.addEventListener("click", () => {
    filtroCategoria.value = "";
    filtroCritico.value = "";

    renderTabla(insumos);
  });
});
