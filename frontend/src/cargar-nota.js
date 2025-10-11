// src/cargar-nota.js
import { definirUsuario } from './services/usuarioEncabezado.js';

const STORAGE_KEY_FORM = 'sigia_form_cargar_nota';
const STORAGE_KEY_INSUMOS = 'sigia_insumos';

document.addEventListener('DOMContentLoaded', () => {
  // inicialización del encabezado/usuario
  try {
    console.log('DOM cargado, ejecutando definirUsuario...');
    if (typeof definirUsuario === 'function') definirUsuario();
  } catch (e) {
    console.warn('Error ejecutando definirUsuario', e);
  }

  // elementos del formulario
  const numeroInput = document.getElementById('numero_tramite');
  const areaInput = document.getElementById('area');
  const nombreInput = document.getElementById('nombre_solicitante');
  const fechaInput = document.getElementById('fecha_solicitud');

  // enlace "Agregar Insumo" (en tu HTML es <a href="agregar-insumo.html">)
  const addInsumoAnchor = document.querySelector('a[href="agregar-insumo.html"]');

  // --------- Form storage (localStorage) ----------
  function saveFormToStorage() {
    try {
      const payload = {
        numero_tramite: (numeroInput && numeroInput.value) || '',
        area: (areaInput && areaInput.value) || '',
        nombre_solicitante: (nombreInput && nombreInput.value) || '',
        fecha_solicitud: (fechaInput && fechaInput.value) || ''
      };
      localStorage.setItem(STORAGE_KEY_FORM, JSON.stringify(payload));
    } catch (e) {
      console.warn('No se pudo guardar form en localStorage', e);
    }
  }

  function loadFormFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FORM);
      if (!raw) return;
      const payload = JSON.parse(raw);
      if (!payload || typeof payload !== 'object') return;
      if (numeroInput && payload.numero_tramite) numeroInput.value = payload.numero_tramite;
      if (areaInput && payload.area) areaInput.value = payload.area;
      if (nombreInput && payload.nombre_solicitante) nombreInput.value = payload.nombre_solicitante;
      if (fechaInput && payload.fecha_solicitud) fechaInput.value = payload.fecha_solicitud;
    } catch (e) {
      console.warn('No se pudo parsear form storage', e);
    }
  }

  // --------- Insumos storage (sessionStorage) ----------
  function getInsumosFromStorage() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY_INSUMOS);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      console.warn('Error parseando insumos desde sessionStorage', e);
      return [];
    }
  }

  function saveInsumosToStorage(insumos) {
    try {
      const arr = Array.isArray(insumos) ? insumos : [];
      sessionStorage.setItem(STORAGE_KEY_INSUMOS, JSON.stringify(arr));
    } catch (e) {
      console.warn('No se pudo guardar insumos en sessionStorage', e);
    }
  }

  // --------- Render insumos en el panel derecho ----------
  function findInsumosPanel() {
    // Buscamos el H3 con el título y subimos hasta encontrar el contenedor que contiene la UI de insumos
    const headings = Array.from(document.querySelectorAll('h3'));
    const targetH3 = headings.find(h => h.textContent && h.textContent.trim().includes('Lista Insumos'));
    if (!targetH3) return null;
    // el panel visible en tu HTML es el ancestor directo que contiene el h3 (el "card")
    return targetH3.closest('div');
  }

  function renderInsumos() {
    const insumos = getInsumosFromStorage();

    const panel = findInsumosPanel();
    if (!panel) {
      console.error('No se encontró el panel derecho para renderizar insumos.');
      return;
    }

    // buscamos el área donde inyectar contenido; en tu HTML es el div con clase flex-1 dentro del panel
    const contentArea = panel.querySelector('.flex-1') || panel.querySelector('div');
    if (!contentArea) {
      console.error('No se encontró el contentArea dentro del panel de insumos.');
      return;
    }

    // limpiamos y renderizamos
    contentArea.innerHTML = '';

    if (!insumos || insumos.length === 0) {
      const p = document.createElement('p');
      p.className = 'text-[#8A9A7A] text-base font-medium';
      p.textContent = 'No hay insumos agregados';
      contentArea.appendChild(p);
      return;
    }

    const ul = document.createElement('ul');
    ul.className = 'w-full space-y-4 divide-y divide-[#E8E2C6]';

    insumos.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = 'py-3 flex items-center justify-between gap-4';

      const left = document.createElement('div');
      left.className = 'flex items-center gap-4';

      const qtyBadge = document.createElement('div');
      qtyBadge.className = 'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-[#F0E6C1]';
      qtyBadge.textContent = item.cantidad ?? '';

      const name = document.createElement('div');
      name.className = 'text-[#4D3C2D] font-semibold';
      name.textContent = item.nombre ?? '';

      left.appendChild(qtyBadge);
      left.appendChild(name);

      const right = document.createElement('div');
      right.className = 'flex items-center gap-3';

      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'px-4 py-2 rounded-full bg-[#E7D9A7] font-medium';
      editBtn.textContent = 'Editar';
      editBtn.addEventListener('click', () => {
        try {
          // guardamos el índice a editar y el formulario actual
          sessionStorage.setItem('sigia_edit_index', String(idx));
          saveFormToStorage();
          // redirigimos a la página de edición/agregar
          window.location.href = 'agregar-insumo.html';
        } catch (e) {
          console.warn('Error al iniciar edición de insumo', e);
        }
      });

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'px-4 py-2 rounded-full bg-[#F3C2C2] font-medium';
      delBtn.textContent = 'Eliminar';
      delBtn.addEventListener('click', () => {
        try {
          if (!confirm(`Eliminar "${item.nombre}" (cantidad: ${item.cantidad}) de la lista?`)) return;
          const arr = getInsumosFromStorage();
          arr.splice(idx, 1);
          saveInsumosToStorage(arr);
          renderInsumos();
        } catch (e) {
          console.warn('Error eliminando insumo', e);
        }
      });

      right.appendChild(editBtn);
      right.appendChild(delBtn);

      li.appendChild(left);
      li.appendChild(right);
      ul.appendChild(li);
    });

    contentArea.appendChild(ul);
  }

  // --------- Inicialización de fecha por defecto (si existe el input) ----------
  if (fechaInput) {
    if (!fechaInput.value) {
      const hoy = new Date();
      // formato YYYY-MM-DD
      const iso = hoy.toISOString().slice(0, 10);
      fechaInput.value = iso;
    }
  }

  // --------- Carga inicial de datos y render ---------
  loadFormFromStorage();
  renderInsumos();

  // --------- Listeners para inputs (si existen) ----------
  [numeroInput, areaInput, nombreInput, fechaInput].forEach(inp => {
    if (!inp) return;
    inp.addEventListener('input', saveFormToStorage);
    inp.addEventListener('blur', saveFormToStorage);
  });

  // Si se hace click en "Agregar Insumo" guardamos el formulario antes de navegar
  if (addInsumoAnchor) {
    addInsumoAnchor.addEventListener('click', (e) => {
      // guardamos el form en localStorage y también una copia en sessionStorage
      saveFormToStorage();
      try {
        const payload = JSON.parse(localStorage.getItem(STORAGE_KEY_FORM) || '{}');
        sessionStorage.setItem(STORAGE_KEY_FORM, JSON.stringify(payload));
      } catch (err) {
        console.warn('No se pudo guardar form en sessionStorage antes de navegar', err);
      }
      // no preventDefault -> deja que el <a> navegue
    });
  } else {
    console.warn('No se encontró el enlace Agregar Insumo (a[href="agregar-insumo.html"])');
  }

  // Exponer utilidades para debugging / pruebas
  window._sigia = {
    saveFormToStorage,
    loadFormFromStorage,
    getInsumosFromStorage,
    saveInsumosToStorage,
    renderInsumos,
    findInsumosPanel
  };
});
