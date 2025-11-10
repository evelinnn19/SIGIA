import { getInsumos } from "./services/InsumoService.js";
import { getCategorias } from "./services/CategoriaService.js";

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
//

const tbody = document.getElementById("tbodyStock");
const filtroCategoria = document.getElementById("filtroCategoria");
const filtroCritico = document.getElementById("filtroCritico");
const formFiltros = document.getElementById("formFiltros");
const btnPdf = document.getElementById("btnPdf");
const btnExcel = document.getElementById("btnExcel");


async function  cargarCategorias() {
    try {
    const categorias = await getCategorias();

    const categoriasActivas = categorias.filter(cat => cat.estado === 1);


    filtroCategoria.innerHTML = '<option value="">Seleccione una categoría</option>';

    categoriasActivas.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.nombre;
      option.textContent = cat.nombre;
      filtroCategoria.appendChild(option);
    });
  } catch (error) {
    console.error("❌ Error al cargar categorías:", error);
  }
}

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

function exportarExcel() {
  const tabla = document.getElementById("tablaStock");
  const ws = XLSX.utils.table_to_sheet(tabla);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Stock");
  XLSX.writeFile(wb, "informe_stock.xlsx");
}


formFiltros.addEventListener("submit", filtrarInsumos);
btnPdf.addEventListener("click", exportarPDF);
btnExcel.addEventListener("click", exportarExcel);


document.addEventListener("DOMContentLoaded", async () => {
  cargarCategorias();
  const insumos = await getInsumos();
  renderTabla(insumos);

  const btnLimpiar = document.getElementById("btnLimpiar");

  btnLimpiar.addEventListener("click", () => {
    filtroCategoria.value = "";
    filtroCritico.value = "";

    renderTabla(insumos);
  });
});
