import { getCategorias } from "./services/CategoriaService.js";

/**
 * Rellena un <select> con las categorías traídas desde la API.
 * @param {string|HTMLElement} target - id del select, o elemento <select>, o selector CSS (ej: "#filtro" o ".mi-select").
 * @param {Object} options
 *    - includeTodas {boolean} añade la opción "Todas" (valor "") al inicio (default: true)
 *    - onlyActive {boolean} si true incluye solo categorias con estado === 1 (default: false)
 *    - valueAsId {boolean} si true usa idCategoria como value; si false usa el nombre como value (default: true)
 */
export async function poblarSelectCategorias(target, { includeTodas = true, onlyActive = false, valueAsId = true } = {}) {
  try {
    const selects = [];

    // resolver target a elementos
    if (typeof target === "string") {
      // puede ser un id "#miSelect", "miSelect" o selector ".clase"
      if (target.startsWith("#")) {
        const el = document.getElementById(target.slice(1));
        if (el) selects.push(el);
      } else {
        // querySelectorAll para selectores o id sin #
        const els = document.querySelectorAll(target);
        if (els.length > 0) selects.push(...els);
        else {
          const byId = document.getElementById(target);
          if (byId) selects.push(byId);
        }
      }
    } else if (target instanceof HTMLElement) {
      selects.push(target);
    } else if (NodeList.prototype.isPrototypeOf(target) || Array.isArray(target)) {
      selects.push(...target);
    }

    if (selects.length === 0) {
      console.warn("poblarSelectCategorias: no se encontró el elemento target:", target);
      return;
    }

    // traer categorias desde la API
    const categorias = await getCategorias(); // espera un array de DTOs
    const lista = Array.isArray(categorias) ? categorias : (categorias ? [categorias] : []);

    // filtrar por activas si corresponde
    const filtradas = onlyActive ? lista.filter(c => Number(c.estado ?? 0) === 1) : lista;

    // construir opciones (evita duplicados por id/nombre)
    const vistos = new Set();
    const opciones = filtradas
      .filter(c => {
        // evitar duplicados por id o nombre
        const key = valueAsId ? String(c.idCategoria ?? c.id ?? "") : (c.nombre ?? "").trim().toLowerCase();
        if (!key) return false;
        if (vistos.has(key)) return false;
        vistos.add(key);
        return true;
      })
      .map(c => {
        const value = valueAsId ? (c.idCategoria ?? c.id ?? "") : (c.nombre ?? "");
        const label = c.nombre ?? value;
        return `<option value="${String(value)}">${label}</option>`;
      });

    // asignar a cada select encontrado
    selects.forEach(sel => {
      let html = "";
      if (includeTodas) html += '<option value="">Todas</option>';
      html += opciones.join("");
      sel.innerHTML = html;
    });

  } catch (error) {
    console.error("❌ Error al cargar categorías:", error);
  }
}
