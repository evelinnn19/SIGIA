/**
 * renderSimpleComprobantePDF
 * - contenedorSelector: selector del elemento donde se inserta la tabla (ej. '#comprobanteWrap')
 * - solicitud: objeto solicitud (para mostrar N°/area/solicitante)
 * - datosComprobante: array con objetos { nombre, area, solicitante, cantidadSolicitada, cantidadEntregada }
 */
export function renderSimpleComprobantePDF(contenedorSelector, solicitud, datosComprobante) {
  const cont = document.querySelector(contenedorSelector);
  if (!cont) {
    console.error('Contenedor no encontrado:', contenedorSelector);
    return;
  }

  // Limpio contenedor
  cont.innerHTML = '';

  // Header simple
  const header = document.createElement('div');
  header.className = 'mb-4';
  header.innerHTML = `
    <h2 style="margin:0 0 6px 0;">COMPROBANTE DE ENTREGA</h2>
    <div style="font-size:0.9rem;color:#444;">
      <strong>N°:</strong> ${solicitud.nroTramite || solicitud.idSolicitud || 'N/A'} —
      <strong>Área:</strong> ${solicitud.area || 'N/A'} —
      <strong>Solicitante:</strong> ${solicitud.solicitante || 'N/A'}
    </div>
  `;
  cont.appendChild(header);

  // Si no hay datos
  if (!Array.isArray(datosComprobante) || datosComprobante.length === 0) {
    const p = document.createElement('p');
    p.textContent = 'No hay items para mostrar en el comprobante.';
    cont.appendChild(p);
    return;
  }

  // Crear tabla
  const wrap = document.createElement('div');
  wrap.style.overflowX = 'auto';

  const table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.fontSize = '0.95rem';

  // thead
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr style="background:#e6f0d9;">
      <th style="padding:8px;border:1px solid #ccc;text-align:left;">Nombre</th>
      <th style="padding:8px;border:1px solid #ccc;text-align:left;">Área</th>
      <th style="padding:8px;border:1px solid #ccc;text-align:left;">Solicitante</th>
      <th style="padding:8px;border:1px solid #ccc;text-align:right;">Cant. Solicitada</th>
      <th style="padding:8px;border:1px solid #ccc;text-align:right;">Cant. Entregada</th>
    </tr>
  `;
  table.appendChild(thead);

  // tbody usando fragment
  const tbody = document.createElement('tbody');
  const frag = document.createDocumentFragment();
  datosComprobante.forEach((item, i) => {
    const tr = document.createElement('tr');
    tr.style.background = i % 2 === 0 ? '#fff' : '#fafafa';

    const tdNombre = document.createElement('td');
    tdNombre.style.padding = '8px'; tdNombre.style.border = '1px solid #ccc';
    tdNombre.textContent = item.nombre ?? '';

    const tdArea = document.createElement('td');
    tdArea.style.padding = '8px'; tdArea.style.border = '1px solid #ccc';
    tdArea.textContent = item.area ?? '';

    const tdSolic = document.createElement('td');
    tdSolic.style.padding = '8px'; tdSolic.style.border = '1px solid #ccc';
    tdSolic.textContent = item.solicitante ?? '';

    const tdCantSol = document.createElement('td');
    tdCantSol.style.padding = '8px'; tdCantSol.style.border = '1px solid #ccc'; tdCantSol.style.textAlign = 'right';
    tdCantSol.textContent = String(item.cantidadSolicitada ?? 0);

    const tdCantEnt = document.createElement('td');
    tdCantEnt.style.padding = '8px'; tdCantEnt.style.border = '1px solid #ccc'; tdCantEnt.style.textAlign = 'right'; tdCantEnt.style.fontWeight = '600';
    tdCantEnt.textContent = String(item.cantidadEntregada ?? 0);

    tr.appendChild(tdNombre);
    tr.appendChild(tdArea);
    tr.appendChild(tdSolic);
    tr.appendChild(tdCantSol);
    tr.appendChild(tdCantEnt);

    frag.appendChild(tr);
  });
  tbody.appendChild(frag);
  table.appendChild(tbody);
  wrap.appendChild(table);
  cont.appendChild(wrap);

  // Footer con fecha
  const fecha = new Date().toLocaleDateString('es-AR');
  const footer = document.createElement('div');
  footer.style.marginTop = '10px';
  footer.style.fontSize = '0.85rem';
  footer.style.color = '#555';
  footer.textContent = `Comprobante generado el ${fecha}`;
  cont.appendChild(footer);

  // Botón PDF (simple)
  const	btnWrap = document.createElement('div');
  btnWrap.style.marginTop = '12px';

  const btnPdf = document.createElement('button');
  btnPdf.textContent = 'Descargar PDF';
  btnPdf.style.padding = '8px 12px';
  btnPdf.style.border = 'none';
  btnPdf.style.background = '#4D3C2D';
  btnPdf.style.color = 'white';
  btnPdf.style.borderRadius = '6px';
  btnPdf.style.cursor = 'pointer';

  btnWrap.appendChild(btnPdf);
  cont.appendChild(btnWrap);

  // Evento: generar PDF con html2pdf (simple y efectivo)
  btnPdf.addEventListener('click', () => {
    if (typeof html2pdf === 'undefined') {
      alert('html2pdf no está cargado. Incluye html2pdf.bundle.min.js (CDN o bundle).');
      return;
    }
    // Creamos un contenedor temporal para el PDF si queremos ajustar márgenes o quitar botones
    const pdfContainer = document.createElement('div');
    // Clonamos solo la parte que queremos en el PDF (header + wrap + footer)
    pdfContainer.appendChild(header.cloneNode(true));
    pdfContainer.appendChild(wrap.cloneNode(true));
    pdfContainer.appendChild(footer.cloneNode(true));

    // Nombre de archivo: comprobante_ID_fecha
    const id = solicitud.nroTramite || solicitud.idSolicitud || 'N-A';
    const fechaFname = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
    const filename = `comprobante_${id}_${fechaFname}.pdf`;

    // Opciones básicas (ajustá margin y scale si querés más resolución)
    const opt = {
      margin:       10, // mm (html2pdf interpreta según su config)
      filename:     filename,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Ejecutar la conversión
    html2pdf().set(opt).from(pdfContainer).save();
  });
}
