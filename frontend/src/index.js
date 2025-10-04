document.querySelector('form').addEventListener('submit', function (e) {
  e.preventDefault();

  const usuario = document.querySelector('input[name="usuario"]').value;
  const password = document.querySelector('input[name="contraseña"]').value;

  if (usuario && password) {
    window.location.href = 'notas-cargadas.html';
  } else {
    alert('Por favor completa todos los campos');
  }
});

/**
   * STOCK MANAGEMENT
   * TODO: Reemplazar este objeto con fetch a la API
   * Endpoint sugerido: GET /api/insumos/stock
   * Respuesta esperada: { "Resma A4": 50, "Lapicera": 100, ... }
   */
  const stockDisponible = {
    'Resma A4': 50,
    'Lapicera': 100,
    'Carpeta': 5
  };

  const inputInsumo = document.querySelector('input[name="nombre_insumo"]');
  const inputCantidad = document.querySelector('input[name="cantidad"]');
  
  const stockDiv = document.createElement('div');
  stockDiv.className = 'mt-2 text-center';
  stockDiv.style.display = 'none';
  inputCantidad.parentElement.appendChild(stockDiv);

  /**
   * Verifica el stock disponible y actualiza la UI
   * TODO: Convertir a función async y agregar llamada a API
   * 
   * Ejemplo de implementación futura:
   * async function verificarStock() {
   *   const insumo = inputInsumo.value;
   *   const response = await fetch(`/api/insumos/stock?nombre=${insumo}`);
   *   const data = await response.json();
   *   const stock = data.stock || 0;
   * }
   */
  function verificarStock() {
    const insumo = inputInsumo.value;
    const cantidad = parseInt(inputCantidad.value) || 0;
    
    const stock = stockDisponible[insumo] || 0;

    if (stock > 0 && cantidad > stock) {
      stockDiv.innerHTML = `
        <p class="text-[#B91C1C] text-sm font-bold">no hay suficiente stock</p>
      `;
      stockDiv.style.display = 'block';
    } else {
      stockDiv.style.display = 'none';
    }
  }

  inputInsumo.addEventListener('input', verificarStock);
  inputCantidad.addEventListener('input', verificarStock);
  
  verificarStock();