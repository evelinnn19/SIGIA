// informe-movimiento-insumos-generado.js
import { getTransacciones, getNameInsumoById } from "./services/TransaccionService.js";
import { getInsumos } from "./services/InsumoService.js";
import { getCategorias } from "./services/CategoriaService.js";
import { definirUsuario } from './services/usuarioEncabezado.js';

document.addEventListener("DOMContentLoaded", async () => {
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

  let todasLasTransacciones = [];

  // traer insumos y transacciones (en paralelo)
  const [insumos, transacciones] = await Promise.all([
    getInsumos(),
    getTransacciones(),
  ]);

  await cargarSelects(insumos, transacciones);

  const mapaInsumos = new Map((insumos || []).map(i => [i.idInsumo, i]));

  todasLasTransacciones = (transacciones || []).map(t => {
    const insumo = mapaInsumos.get(t.idInsumo);
    return {
      ...t,
      nombreInsumo: insumo ? insumo.nombre : "Desconocido",
      categoriaInsumo: insumo ? insumo.categoria : "Sin categoría",
    };
  });

  renderTabla(todasLasTransacciones);

  btnFiltrar.addEventListener("click", aplicarFiltros);
  btnLimpiar.addEventListener("click", limpiarFiltros);
  btnPdf.addEventListener("click", exportarPDF);
  btnExcel.addEventListener("click", exportarExcel);
  [filtroCategoria, filtroInsumo, filtroArea, filtroTipo, inputDesde, inputHasta].forEach((el) =>
    el.addEventListener("change", aplicarFiltros)
  );

  function formatearFecha(iso) {
    if (!iso) return "-";
    const d = new Date(iso);
    const fechaCorregida = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    return fechaCorregida.toLocaleDateString("es-AR");
  }

  // ---- nueva función: cargarCategorias usando getCategorias() ----
  async function cargarCategorias() {
    try {
      const categorias = await getCategorias(); // espera array de DTOs
      const lista = Array.isArray(categorias) ? categorias : (categorias ? [categorias] : []);

      // solo activas
      const categoriasActivas = lista.filter(cat => Number(cat.estado ?? 0) === 1);

      // ordenar por nombre (opcional, mejora UX)
      categoriasActivas.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));

      // limpiar y poblar select
      filtroCategoria.innerHTML = '<option value="">Todas</option>';
      categoriasActivas.forEach((cat) => {
        const opt = document.createElement("option");
        // usamos el nombre como value porque las transacciones comparan por nombre de categoría
        opt.value = cat.nombre ?? "";
        opt.textContent = cat.nombre ?? (cat.idCategoria ?? "");
        filtroCategoria.appendChild(opt);
      });
    } catch (error) {
      console.error("❌ Error al cargar categorías:", error);
      // mantener opción por defecto si hay error
      filtroCategoria.innerHTML = '<option value="">Todas</option>';
    }
  }

  // ---- cargar los otros selects ----
  async function cargarSelects(insumos, transacciones) {
    try {
      // cargar categorías desde la API
      await cargarCategorias();

      const nombresInsumos = [...new Set((insumos || []).map((i) => i.nombre).filter(Boolean))];
      filtroInsumo.innerHTML =
        '<option value="">Todos</option>' +
        nombresInsumos.map((n) => `<option value="${n}">${n}</option>`).join("");

      const areas = [
        ...new Set((transacciones || []).map((t) => t.areaDestino || t.areaSolicitante).filter(Boolean)),
      ];
      filtroArea.innerHTML =
        '<option value="">Todas</option>' +
        areas.map((a) => `<option value="${a}">${a}</option>`).join("");

      const tipos = [...new Set((transacciones || []).map((t) => t.tipo).filter(Boolean))];
      filtroTipo.innerHTML =
        '<option value="">Todos</option>' +
        tipos.map((t) => `<option value="${t}">${t}</option>`).join("");
    } catch (error) {
      console.error("❌ Error cargando selects:", error);
    }
  }

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

  function aplicarFiltros() {
    const categoria = filtroCategoria.value;
    const insumo = filtroInsumo.value;
    const area = filtroArea.value;
    const tipo = filtroTipo.value;
    const desde = inputDesde.value ? new Date(inputDesde.value) : null;
    const hasta = inputHasta.value ? new Date(inputHasta.value) : null;

    const filtradas = todasLasTransacciones.filter((t) => {
      const coincideCategoria = categoria ? t.categoriaInsumo === categoria : true;
      const coincideInsumo = insumo ? t.nombreInsumo === insumo : true;
      const coincideArea = area ? t.areaDestino === area : true;
      const coincideTipo = tipo ? t.tipo === tipo : true;

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

  function limpiarFiltros() {
    filtroCategoria.value = "";
    filtroInsumo.value = "";
    filtroArea.value = "";
    filtroTipo.value = "";
    inputDesde.value = "";
    inputHasta.value = "";
    renderTabla(todasLasTransacciones);
  }

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

  function exportarExcel() {
    const tabla = document.getElementById("tablaMovimientos");
    const ws = XLSX.utils.table_to_sheet(tabla);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Movimientos");
    XLSX.writeFile(wb, "informe_movimientos.xlsx");
  }
});
