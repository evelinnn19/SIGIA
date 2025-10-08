
import { definirUsuario } from './services/usuarioEncabezado.js';

document.addEventListener("DOMContentLoaded", () => {
        console.log('DOM cargado, ejecutando definirUsuario...');
        definirUsuario();
      });

const STORAGE_KEY_FORM = 'sigia_form_cargar_nota';
const STORAGE_KEY_INSUMOS = 'sigia_insumos';

document.addEventListener('DOMContentLoaded', () => {
  const numeroInput = document.getElementById('numero_tramite');
  const areaInput = document.getElementById('area');
  const nombreInput = document.getElementById('nombre_solicitante');
  const fechaInput = document.getElementById('fecha_solicitud');


  const addInsumoAnchor = document.querySelector('a[href="agregar-insumo.html"]');

  function saveFormToStorage() {
    const payload = {
      numero_tramite: numeroInput.value || '',
      area: areaInput.value || '',
      nombre_solicitante: nombreInput.value || '',
      fecha_solicitud: fechaInput.value || ''
    };
    sessionStorage.setItem(STORAGE_KEY_FORM, JSON.stringify(payload));
  }

  function loadFormFromStorage() {
    const raw = sessionStorage.getItem(STORAGE_KEY_FORM);
    if (!raw) return;
    try {
      const payload = JSON.parse(raw);
      if (payload.numero_tramite) numeroInput.value = payload.numero_tramite;
      if (payload.area) areaInput.value = payload.area;
      if (payload.nombre_solicitante) nombreInput.value = payload.nombre_solicitante;
      if (payload.fecha_solicitud) fechaInput.value = payload.fecha_solicitud;
    } catch (e) {
      console.warn('No se pudo parsear form storage', e);
    }
  }

  function getInsumosFromStorage() {
    const raw = sessionStorage.getItem(STORAGE_KEY_INSUMOS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Error parseando insumos', e);
      return [];
    }
  }

  function saveInsumosToStorage(insumos) {
    sessionStorage.setItem(STORAGE_KEY_INSUMOS, JSON.stringify(insumos));
  }

  function renderInsumos() {
    const insumos = getInsumosFromStorage();

    const panel = document.querySelector('.bg-[#F7EEC3].rounded-3xl') || document.querySelector('.bg-[#F7EEC3]');
    if (!panel) {
      console.error('No se encontró el panel derecho para renderizar insumos.');
      return;
    }
    const contentArea = panel.querySelector('.flex-1') || panel.querySelector('div');

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
        sessionStorage.setItem('sigia_edit_index', String(idx));
        saveFormToStorage();
        window.location.href = 'agregar-insumo.html';
      });

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'px-4 py-2 rounded-full bg-[#F3C2C2] font-medium';
      delBtn.textContent = 'Eliminar';
      delBtn.addEventListener('click', () => {
        if (!confirm(`Eliminar "${item.nombre}" (cantidad: ${item.cantidad}) de la lista?`)) return;
        const arr = getInsumosFromStorage();
        arr.splice(idx, 1);
        saveInsumosToStorage(arr);
        renderInsumos();
      });

      right.appendChild(editBtn);
      right.appendChild(delBtn);

      li.appendChild(left);
      li.appendChild(right);
      ul.appendChild(li);
    });

    contentArea.appendChild(ul);
  }

  if (!fechaInput.value) {
    const hoy = new Date();
    const iso = hoy.toISOString().slice(0, 10); 
    fechaInput.value = iso;
  }

  
  loadFormFromStorage();
  renderInsumos();

  [numeroInput, areaInput, nombreInput, fechaInput].forEach(inp => {
    inp.addEventListener('input', saveFormToStorage);
    inp.addEventListener('blur', saveFormToStorage);
  });

  if (addInsumoAnchor) {
    addInsumoAnchor.addEventListener('click', (e) => {
      saveFormToStorage();
    });
  } else {
    console.warn('No se encontró el enlace Agregar Insumo (a href="agregar-insumo.html")');
  }

  window._sigia = {
    saveFormToStorage,
    loadFormFromStorage,
    getInsumosFromStorage,
    saveInsumosToStorage,
    renderInsumos
  };
});
