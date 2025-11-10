// src/solicitar-insumo.js
import { definirUsuario } from './services/usuarioEncabezado.js';
import { getInsumos, updateInsumo } from './services/InsumoService.js';
import { createTransaccion } from './services/TransaccionService.js';
import { registrarActividad } from './services/actividadUtilidad.js';

document.addEventListener('DOMContentLoaded', async () => {
  definirUsuario();

  // DOM
  const form = document.querySelector('form');
  const nombreInsumo = document.querySelector('select[name="nombre_insumo"]');
  const areaSelect = document.querySelector('select[name="area"]');
  const cantidad = document.querySelector('input[name="cantidad"]');
  const nombreSolicitante = document.querySelector('input[name="nombre_solicitante"]');
  const btnCancelar = document.querySelector('button[type="button"]');
  const btnConfirmar = document.querySelector('button[type="submit"]');

  // popups
  const popupExito = document.getElementById("popupExito");
  const popupMensajeExito = document.getElementById("popupMensajeExito");
  const btnCerrarExito = document.getElementById("btnCerrarExito");

  const popupError = document.getElementById("popupError");
  const popupMensajeError = document.getElementById("popupMensajeError");
  const popupDetalleError = document.getElementById("popupDetalleError");
  const btnCerrarError = document.getElementById("btnCerrarError");


  // usuario actual
  const usuarioActualRaw = localStorage.getItem('usuarioActual');
  const usuarioActual = usuarioActualRaw ? Number(usuarioActualRaw) : null;

  // Areas (como tenías)
  const Areas = [
    "Seleccionar Area",
    "Bedelía",
    "Posgrado",
    "Matemática",
    "Extensión",
    "GaME",
    "Académica",
    "Consejo",
    "RRHH",
    "Agrimensura",
    "Ciencia y Tecnica",
    "Dpto Alumnos",
  ];

  // poblar áreas
  areaSelect.innerHTML = ""; // limpiar
  for (let area of Areas) {
    const option = document.createElement('option');
    option.value = area === "Seleccionar Area" ? "" : area;
    option.textContent = area;
    areaSelect.appendChild(option);
  }

  // estado local
  let insumos = [];
  let insumoSeleccionado = null;

  // Funciones popup
  function mostrarExito(mensaje) {
    popupMensajeExito.textContent = mensaje;
    popupExito.classList.remove("hidden");
  }
  function cerrarExito() {
    popupExito.classList.add("hidden");
  }
  function mostrarError(mensaje, detalle = "") {
    popupMensajeError.textContent = "Error";
    popupDetalleError.textContent = detalle || mensaje || "Ocurrió un error.";
    popupError.classList.remove("hidden");
  }
  function cerrarError() {
    popupError.classList.add("hidden");
  }

  btnCerrarExito?.addEventListener("click", () => {
    cerrarExito();
    // opcional: volver atrás
    window.history.back();
  });
  btnCerrarError?.addEventListener("click", cerrarError);

  // deshabilitar botón
  function deshabilitarBoton(deshabilitar) {
    if (deshabilitar) {
      btnConfirmar.disabled = true;
      btnConfirmar.style.opacity = '0.5';
      btnConfirmar.style.cursor = 'not-allowed';
    } else {
      btnConfirmar.disabled = false;
      btnConfirmar.style.opacity = '1';
      btnConfirmar.style.cursor = 'pointer';
    }
  }

  // Cargar insumos desde la API y poblar el select (con opción "Seleccionar Insumo" al inicio)
  async function poblarInsumos() {
    try {
      insumos = await getInsumos() || [];
      // limpiar select y agregar opción por defecto
      nombreInsumo.innerHTML = '';
      const primera = document.createElement('option');
      primera.value = '';
      primera.textContent = 'Seleccionar Insumo';
      nombreInsumo.appendChild(primera);

      // ordenar por nombre para mejor UX
      insumos.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));

      for (let insumo of insumos) {
        const option = document.createElement('option');
        option.value = insumo.nombre; // mantengo tu lógica que busca por nombre
        // puedes mostrar stock entre paréntesis si querés: `${insumo.nombre} (stock: ${insumo.stockActual})`
        option.textContent = insumo.nombre;
        nombreInsumo.appendChild(option);
      }
    } catch (err) {
      console.error("Error al cargar insumos:", err);
      // en caso de error, dejamos una opción informativa
      nombreInsumo.innerHTML = '<option value="">No se pudieron cargar insumos</option>';
    }
  }

  // validación del formulario (stock y campos requeridos)
  function validarFormularioCompleto() {
    let formularioValido = true;

    // quitar mensaje anterior
    const mensajeAnterior = document.querySelector('.mensaje-cantidad');
    if (mensajeAnterior) mensajeAnterior.remove();
    cantidad.style.outline = '';

    const areaValida = areaSelect.value !== "";
    if (!areaValida) formularioValido = false;

    const insumoValido = nombreInsumo.value !== "";
    if (!insumoValido) formularioValido = false;

    if (insumoSeleccionado && cantidad.value) {
      const cantidadSolicitada = Number(cantidad.value);
      if (Number.isNaN(cantidadSolicitada) || cantidadSolicitada <= 0) {
        formularioValido = false;
        const mensaje = document.createElement('span');
        mensaje.className = 'mensaje-cantidad block text-red-600 text-xs mt-1 font-medium';
        mensaje.innerText = "Ingrese una cantidad válida";
        cantidad.parentNode.appendChild(mensaje);
        cantidad.style.outline = '2px solid rgba(239, 68, 68, 0.5)';
      } else if (cantidadSolicitada > (insumoSeleccionado.stockActual ?? 0)) {
        formularioValido = false;
        const mensaje = document.createElement('span');
        mensaje.className = 'mensaje-cantidad block text-red-600 text-xs mt-1 font-medium';
        mensaje.innerText = "Stock insuficiente";
        cantidad.parentNode.appendChild(mensaje);
        cantidad.style.outline = '2px solid rgba(239, 68, 68, 0.5)';
      }
    }

    deshabilitarBoton(!formularioValido);
  }

  // listeners
  nombreInsumo.addEventListener('change', () => {
    insumoSeleccionado = insumos.find(i => i.nombre === nombreInsumo.value) || null;

    const mensajeStock = document.getElementById('mensajeStock');
    const stock = Number(insumoSeleccionado.stockActual);
    mensajeStock.textContent = `Stock actual: ${stock}`;
    mensajeStock.classList.remove('hidden');
    validarFormularioCompleto();
  });

  cantidad.addEventListener('input', validarFormularioCompleto);
  areaSelect.addEventListener('change', validarFormularioCompleto);

  // cancelar: limpiar o volver (como prefieras)
  btnCancelar.addEventListener('click', (e) => {
    e.preventDefault();
    form.reset();
    insumoSeleccionado = null;
    deshabilitarBoton(true);
    // volver a la lista anterior (opcional)
    window.history.back();
  });

  // submit
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // validación final
    if (!insumoSeleccionado) {
      mostrarError("Debe seleccionar un insumo.");
      return;
    }
    const cantidadSolicitada = Number(cantidad.value);
    if (!cantidadSolicitada || cantidadSolicitada <= 0) {
      mostrarError("Cantidad inválida.");
      return;
    }
    if (cantidadSolicitada > (insumoSeleccionado.stockActual ?? 0)) {
      mostrarError("Stock insuficiente para el insumo seleccionado.");
      return;
    }
    if (!areaSelect.value) {
      mostrarError("Debe seleccionar un área.");
      return;
    }

    // construir transacción
    const transaccion = {
      tipo: "Egreso",
      fecha: new Date().toISOString().split('T')[0],
      cantidad: cantidadSolicitada,
      areaDestino: areaSelect.value,
      solicitante: nombreSolicitante.value || "",
      idInsumo: insumoSeleccionado.idInsumo,
      idUsuario: usuarioActual
    };



    // bloquear boton para evitar doble submit
    deshabilitarBoton(true);

    try {
      // actualizar stock local
      insumoSeleccionado.stockActual = (insumoSeleccionado.stockActual ?? 0) - cantidadSolicitada;

      // persistir cambios
      await updateInsumo(insumoSeleccionado.idInsumo, insumoSeleccionado);
      await createTransaccion(transaccion);

      // registrar actividad (no romper si falla)
      try {
        await registrarActividad(
          usuarioActual,
          "Egreso",
          `${nombreSolicitante.value || "Solicitante"} llevó ${cantidadSolicitada} unidaddes de ${insumoSeleccionado.nombre}`,
          areaSelect.value
        );
      } catch (warn) {
        console.warn("No se pudo registrar actividad:", warn);
      }

      // mostrar popup éxito, limpiar formulario
      mostrarExito(`Solicitud procesada con exito: `);
      form.reset();
      insumoSeleccionado = null;
      deshabilitarBoton(true);

    } catch (err) {
      console.error('Error al procesar solicitud:', err);
      mostrarError("No se pudo procesar la solicitud", err?.message || "");
      deshabilitarBoton(false);
    }
  });


    if(insumoSeleccionado != null){
        const mensajeStock = document.getElementById('mensajeStock');
  const stock = Number(insumoSeleccionado.stockActual);
  mensajeStock.textContent = `Stock actual: ${stock}`;
  mensajeStock.classList.remove('hidden');

  // Comprobar la cantidad ingresada
  const valor = Number(cantidad.value);
  const excede = !Number.isNaN(valor) && valor > stock;

  if (excede) {
    // marcar input y mensaje en rojo
    cantidad.style.outline = '2px solid rgba(239,68,68,0.5)';
    mensajeStock.style.color = '#B91C1C'; // text-red-600
  } else {
    // estilo normal
    cantidad.style.outline = '';
    mensajeStock.style.color = '#4D3C2D'; // color de texto estándar
  }
    }

  // Inicializar
  deshabilitarBoton(true);
  await poblarInsumos();
});
