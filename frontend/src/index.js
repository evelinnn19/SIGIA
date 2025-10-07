import { getUsuarioByMail } from "./services/UsuarioService";




document.querySelector('form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const usuario = document.querySelector('input[name="usuario"]').value;
  const password = document.querySelector('input[name="contraseña"]').value;

  console.log(password);
  try {
    // 👇 Esperás la respuesta de tu función
    const usuarioBD = await getUsuarioByMail(usuario);

    console.log('Usuario obtenido:', usuarioBD);

    // Ejemplo: si usuarioBD es un array (según tu backend)
    if (usuarioBD.length > 0) {
      const usuarioData = usuarioBD[0];
      const rol = usuarioData.rol;
      const rolCapitalizado = rol.charAt(0).toUpperCase() + rol.slice(1);
      if (usuarioData.contrasena === password) {
        console.log(usuarioData.contrasena)
        console.log('Login exitoso');
        console.log(rolCapitalizado);

        const usuarioActual = usuarioData.idUsuario;
        console.log(usuarioActual);
        localStorage.setItem('usuarioActual',usuarioActual);
        
        localStorage.setItem('rolActual',rolCapitalizado);



        if(rol === "administrador"){
          window.location.href = "../administrador.html"
        }

        if(rol === "No Docente"){
          window.location.href = "../notas-cargadas.html"
        }

        
        if(rol === "encargado"){
          window.location.href = "../encargado.html"
        }


      } else {
        console.log('Contraseña incorrecta');
      }
    } else {
      console.log('Usuario no encontrado');
    }
  } catch (error) {
    console.error('Error al obtener usuario:', error);
  }
});

// /**
//    * STOCK MANAGEMENT
//    * TODO: Reemplazar este objeto con fetch a la API
//    * Endpoint sugerido: GET /api/insumos/stock
//    * Respuesta esperada: { "Resma A4": 50, "Lapicera": 100, ... }
//    */
//   const stockDisponible = {
//     'Resma A4': 50,
//     'Lapicera': 100,
//     'Carpeta': 5
//   };

//   const inputInsumo = document.querySelector('input[name="nombre_insumo"]');
//   const inputCantidad = document.querySelector('input[name="cantidad"]');
  
//   const stockDiv = document.createElement('div');
//   stockDiv.className = 'mt-2 text-center';
//   stockDiv.style.display = 'none';
//   inputCantidad.parentElement.appendChild(stockDiv);

//   /**
//    * Verifica el stock disponible y actualiza la UI
//    * TODO: Convertir a función async y agregar llamada a API
//    * 
//    * Ejemplo de implementación futura:
//    * async function verificarStock() {
//    *   const insumo = inputInsumo.value;
//    *   const response = await fetch(`/api/insumos/stock?nombre=${insumo}`);
//    *   const data = await response.json();
//    *   const stock = data.stock || 0;
//    * }
//    */
//   function verificarStock() {
//     const insumo = inputInsumo.value;
//     const cantidad = parseInt(inputCantidad.value) || 0;
    
//     const stock = stockDisponible[insumo] || 0;

//     if (stock > 0 && cantidad > stock) {
//       stockDiv.innerHTML = `
//         <p class="text-[#B91C1C] text-sm font-bold">no hay suficiente stock</p>
//       `;
//       stockDiv.style.display = 'block';
//     } else {
//       stockDiv.style.display = 'none';
//     }
//   }

//   inputInsumo.addEventListener('input', verificarStock);
//   inputCantidad.addEventListener('input', verificarStock);
  
//   verificarStock();